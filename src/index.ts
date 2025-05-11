import crypto from 'crypto';
import express from 'express';
import { AppError, errorHandler } from './middleware/errorHandler';
import { db } from './db';
import { and, eq, Query, sql } from 'drizzle-orm';
import { apiKeys } from './db/schema/apiKeys';
import { meals } from './db/schema/meals';
import { keyGenerationLimiter, apiLimiter } from './middleware/rateLimiter';
import { createApiKeySchema, createMealSchema } from './validation';

const app = express()
app.use(express.json())

// API key auth middleware
async function authenticateApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey
    
    if (!apiKey) {
        throw new AppError('API key required', 401)
    }

    try {
        const validKey = await db.query.apiKeys.findFirst({
            where: and(
                eq(apiKeys.key, apiKey as string),
                eq(apiKeys.active, true)
            )
        })

        if (!validKey) {
            throw new AppError('Invalid API key', 403)
        }

        next()
    } catch (error) {
        next(error)
    }
}

// Routes
app.get("/", (req, res) => {
    res.send("Chakula API")
})

// generating new API key with rate Limiting
app.post("/api-keys", keyGenerationLimiter, async (req, res, next) => {
    try {
        const { name } = createApiKeySchema.parse(req.body)
        const apiKey = crypto.randomBytes(32).toString('hex')

        const[newKey] = await db.insert(apiKeys).values({
            key: apiKey,
            name,
            active: true,
        }).returning()

        res.status(201).json({
            key: newKey.key,
            name: newKey.name,
            created_at: newKey.created_at,
        })
    } catch (error) {
        next(error)
    }
})

// get all API keys(protected)
app.get("/api-keys", authenticateApiKey, async (req, res, next) => {
    try {
        const keys = await db.query.apiKeys.findMany()

        res.status(200).json(keys)
    } catch (error) {
        next(error)
    }
})

// Get meal suggestions (protected)
app.get("/meals", authenticateApiKey, apiLimiter, async (req, res, next) => {
    const { category, limit = 10 } = req.query;
    try {
        let query = db.select().from(meals);

        if (category) {
            query = query.where(
                sql`${meals.category} @> ARRAY[${category}]::text[]`
            ) as any;
        }

        const results = await query.limit(Number(limit));
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Add a new meal (protected)
app.post("/meals", authenticateApiKey, apiLimiter, async (req, res, next) => {
    try {
        const validatedData = createMealSchema.parse(req.body);

      // Normalize data to arrays
        const categories = Array.isArray(validatedData.category) 
            ? validatedData.category 
            : [validatedData.category];

        const imageUrls = Array.isArray(validatedData.image_url)
            ? validatedData.image_url
            : [validatedData.image_url];

        const [newMeal] = await db.insert(meals).values({
            name: validatedData.name,
            description: validatedData.description,
            category: categories,
            image_url: imageUrls,
        }).returning();

        res.status(201).json(newMeal);
    } catch (error) {
        next(error);
    }
});

// Apply error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});