import { pgTable, serial, varchar, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    categoryId: integer('category_id').references(() => categories.id),
    type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description'),
    proofUrl: varchar('proof_url', { length: 255 }),
    transactionDate: timestamp('transaction_date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
