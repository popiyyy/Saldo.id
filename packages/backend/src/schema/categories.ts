import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
