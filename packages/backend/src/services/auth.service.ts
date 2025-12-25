import { db } from '../config/database';
import { users, type User, type NewUser } from '../schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export class AuthService {
    async register(data: Omit<NewUser, 'id' | 'createdAt'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const [user] = await db
            .insert(users)
            .values({
                ...data,
                password: hashedPassword,
            })
            .returning();

        return user;
    }

    async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { user, token };
    }

    async getUserById(id: number): Promise<User | null> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user || null;
    }

    async updateUser(id: number, data: { name?: string; email?: string }): Promise<User | null> {
        const [updated] = await db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning();

        return updated || null;
    }

    verifyToken(token: string): { id: number; email: string; role: string } | null {
        try {
            return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
        } catch {
            return null;
        }
    }
}

export const authService = new AuthService();
