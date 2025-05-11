import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const apiKeys = pgTable("api_keys", {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    active: boolean("active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});