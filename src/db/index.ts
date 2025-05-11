import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as apiKeysSchema from './schema/apiKeys'
import * as mealsSchema from './schema/meals'

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
})

export const db = drizzle({ client: pool , schema: {
    ...apiKeysSchema,
    ...mealsSchema
}})