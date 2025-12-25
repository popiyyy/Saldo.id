import { db } from '../config/database';
import { transactions } from '../schema';
import { eq, sql, gte, lte, and } from 'drizzle-orm';

export class StatsService {
    async getSummary(userId?: number, role?: string) {
        const baseQuery = role === 'owner' ? db.select() : db.select().from(transactions).where(eq(transactions.userId, userId!));

        // Get total income
        const incomeResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
            })
            .from(transactions)
            .where(
                role === 'owner'
                    ? eq(transactions.type, 'income')
                    : and(eq(transactions.type, 'income'), eq(transactions.userId, userId!))
            );

        // Get total expense
        const expenseResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
            })
            .from(transactions)
            .where(
                role === 'owner'
                    ? eq(transactions.type, 'expense')
                    : and(eq(transactions.type, 'expense'), eq(transactions.userId, userId!))
            );

        const income = parseFloat(incomeResult[0]?.total || '0');
        const expense = parseFloat(expenseResult[0]?.total || '0');
        const profit = income - expense;
        const balance = income - expense; // Simplified, could be more complex

        return {
            income,
            expense,
            profit,
            balance,
        };
    }

    async getTodayStats(userId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateFilter = and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, today),
            lte(transactions.transactionDate, tomorrow)
        );

        // Today's income
        const incomeResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
            })
            .from(transactions)
            .where(and(dateFilter, eq(transactions.type, 'income')));

        // Today's expense
        const expenseResult = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
            })
            .from(transactions)
            .where(and(dateFilter, eq(transactions.type, 'expense')));

        // Today's transaction count
        const countResult = await db
            .select({
                count: sql<number>`COUNT(*)`,
            })
            .from(transactions)
            .where(dateFilter);

        const income = parseFloat(incomeResult[0]?.total || '0');
        const expense = parseFloat(expenseResult[0]?.total || '0');

        return {
            totalIncome: income,
            totalExpense: expense,
            transactionCount: countResult[0]?.count || 0,
            balance: income - expense,
        };
    }

    async getChartData(days: number = 7, userId?: number, role?: string) {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dateFilter = and(
                gte(transactions.transactionDate, date),
                lte(transactions.transactionDate, nextDate),
                role === 'owner' ? undefined : eq(transactions.userId, userId!)
            );

            const incomeResult = await db
                .select({
                    total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
                })
                .from(transactions)
                .where(and(dateFilter, eq(transactions.type, 'income')));

            const expenseResult = await db
                .select({
                    total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
                })
                .from(transactions)
                .where(and(dateFilter, eq(transactions.type, 'expense')));

            data.push({
                date: date.toISOString().split('T')[0],
                income: parseFloat(incomeResult[0]?.total || '0'),
                expense: parseFloat(expenseResult[0]?.total || '0'),
            });
        }

        return data;
    }
}

export const statsService = new StatsService();
