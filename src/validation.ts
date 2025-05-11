import { z } from 'zod';

export const createApiKeySchema = z.object({
    name: z.string().min(3).max(255),
})

export const createMealSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    category: z.union([
        z.string().min(3),
        z.array(z.string().min(3)).min(1)
    ]),
    image_url: z.union([
        z.string().url(),
        z.array(z.string().url()).min(1)
    ]),
});