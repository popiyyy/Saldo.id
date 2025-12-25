import { db } from '../config/database';
import { transactions, type Transaction, type NewTransaction, categories, users } from '../schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export class TransactionService {
    async getAll(userId?: number, role?: string): Promise<Transaction[]> {
        if (role === 'owner') {
            // Owner can see all transactions
            return db
                .select()
                .from(transactions)
                .orderBy(desc(transactions.transactionDate));
        }

        // Staff can only see their own transactions
        if (userId) {
            return db
                .select()
                .from(transactions)
                .where(eq(transactions.userId, userId))
                .orderBy(desc(transactions.transactionDate));
        }

        return [];
    }

    async getById(id: number): Promise<Transaction | null> {
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, id))
            .limit(1);

        return transaction || null;
    }

    async create(data: Omit<NewTransaction, 'id' | 'createdAt'>): Promise<Transaction> {
        const [transaction] = await db
            .insert(transactions)
            .values(data)
            .returning();

        return transaction;
    }

    async update(id: number, data: Partial<NewTransaction>): Promise<Transaction | null> {
        const [updated] = await db
            .update(transactions)
            .set(data)
            .where(eq(transactions.id, id))
            .returning();

        return updated || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await db
            .delete(transactions)
            .where(eq(transactions.id, id))
            .returning();

        return result.length > 0;
    }

    async getTodayTransactions(userId: number): Promise<Transaction[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.userId, userId),
                    gte(transactions.transactionDate, today),
                    lte(transactions.transactionDate, tomorrow)
                )
            )
            .orderBy(desc(transactions.transactionDate));
    }

    async getWithDetails(): Promise<any[]> {
        return db
            .select({
                id: transactions.id,
                type: transactions.type,
                amount: transactions.amount,
                description: transactions.description,
                proofUrl: transactions.proofUrl,
                transactionDate: transactions.transactionDate,
                createdAt: transactions.createdAt,
                userName: users.name,
                userEmail: users.email,
                categoryName: categories.name,
                categoryType: categories.type,
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .orderBy(desc(transactions.transactionDate));
    }
}

export const transactionService = new TransactionService();
