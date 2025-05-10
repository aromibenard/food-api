import { pgTable, serial , text, varchar, timestamp } from "drizzle-orm/pg-core";

export const meals = pgTable("meals", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: text("category").array().notNull(),
    image_url: text("image_url").array().notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});