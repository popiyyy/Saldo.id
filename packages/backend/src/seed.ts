import { db } from './config/database';
import { users, categories } from './schema';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Create default users
        const hashedAdminPassword = await bcrypt.hash('admin', 10);
        const hashedStaffPassword = await bcrypt.hash('staff', 10);

        await db.insert(users).values([
            {
                email: 'admin',
                password: hashedAdminPassword,
                name: 'Admin Owner',
                role: 'owner',
            },
            {
                email: 'staff',
                password: hashedStaffPassword,
                name: 'Budi Pratama',
                role: 'staff',
            },
        ]).onConflictDoNothing();

        console.log('✅ Users seeded');

        // Create default categories
        await db.insert(categories).values([
            // Income categories
            { name: 'Gaji', type: 'income' },
            { name: 'Bonus', type: 'income' },
            { name: 'Investasi', type: 'income' },
            { name: 'Penjualan', type: 'income' },
            { name: 'Lainnya', type: 'income' },
            // Expense categories
            { name: 'Operasional', type: 'expense' },
            { name: 'Marketing', type: 'expense' },
            { name: 'Logistik', type: 'expense' },
            { name: 'ATK', type: 'expense' },
            { name: 'Utilitas', type: 'expense' },
            { name: 'Lainnya', type: 'expense' },
        ]).onConflictDoNothing();

        console.log('✅ Categories seeded');

        console.log('🎉 Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
