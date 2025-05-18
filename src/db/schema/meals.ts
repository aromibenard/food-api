import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const meals = pgTable("meals", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    imageUrl: text("image_url").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;