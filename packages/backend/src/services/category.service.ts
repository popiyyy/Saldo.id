import { db } from '../config/database';
import { categories, type Category, type NewCategory } from '../schema';
import { eq } from 'drizzle-orm';

export class CategoryService {
    async getAll(): Promise<Category[]> {
        return db.select().from(categories);
    }

    async getByType(type: 'income' | 'expense'): Promise<Category[]> {
        return db
            .select()
            .from(categories)
            .where(eq(categories.type, type));
    }

    async getById(id: number): Promise<Category | null> {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        return category || null;
    }

    async create(data: Omit<NewCategory, 'id'>): Promise<Category> {
        const [category] = await db
            .insert(categories)
            .values(data)
            .returning();

        return category;
    }

    async update(id: number, data: Partial<NewCategory>): Promise<Category | null> {
        const [updated] = await db
            .update(categories)
            .set(data)
            .where(eq(categories.id, id))
            .returning();

        return updated || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await db
            .delete(categories)
            .where(eq(categories.id, id))
            .returning();

        return result.length > 0;
    }
}

export const categoryService = new CategoryService();
