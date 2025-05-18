import crypto from 'crypto';
import express from 'express';
import { AppError, errorHandler } from './middleware/errorHandler';
import { db } from './db';
import { and, eq , sql } from 'drizzle-orm';
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

// ******************************************************
// GET MEAL SUGGESTIONS (PROTECTED)
// ********************************
//         QUERY OPTIONS
// ********************************
//
// 1. Basic request (default limit 10)
//    curl -H "x-api-key: key" http://localhost:3000/meals
//  ------------------------------------------------
// 2. Custom limit and offset
//    curl -H "x-api-key: key" 
//      "http://localhost:3000/meals?limit=5&offset=10"
//  ------------------------------------------------
// 3. With search
//    curl -H "x-api-key: key" 
//      "http://localhost:3000/meals?search=rice"
//  ------------------------------------------------
// 4. With search  + pagination
//    curl -H "x-api-key: key"
//       "http://localhost:3000/meals?search=rice&limit=5&offset=0"
//
// ******************************************************************

app.get("/meals", authenticateApiKey, apiLimiter, async (req, res, next) => {
    try {
        const { limit = 10, offset = 0, search } = req.query 
        let query = db.select().from(meals);

        if (search) {
            query = query.where(sql`${meals.title} ILIKE ${'%' + search + '%'}`) as any;
        }
        
        const results = await query
            .limit(Number(limit))
            .offset(Number(offset))

        res.json(results);
    } catch (error) {
        next(error);
    }
});

//  **** EXAMPLE REQUESTS ******
//  ----------------------------------
//  GET /meals/random → 1 random meal
//  GET /meals/random?count=5 → 5 random meals
//  GET /meals/random?count=20

app.get('/meals/random', authenticateApiKey, apiLimiter, async (req, res, next) => {
    try {
        // default to 1, max 10;
        const count = Math.min(Number(req.query.count) || 1, 10) 

        const randomMeals = await db 
            .select()
            .from(meals)
            .orderBy(sql`RANDOM()`)
            .limit(count)

        if(!randomMeals || randomMeals.length === 0) {
            throw new AppError('No meals found', 404)
        }

        res.json(count === 1 ? randomMeals[0] : randomMeals);
    } catch (error) { next(error) }
})

// Apply error handler middleware
app.use(errorHandler);

export default app;
