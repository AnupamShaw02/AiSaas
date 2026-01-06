import 'dotenv/config';
import sql from './configs/db.js';

async function setupDatabase() {
    try {
        console.log('Setting up database tables...\n');

        // Create articles table
        await sql`
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                prompt TEXT NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Articles table created');

        // Create creations table
        await sql`
            CREATE TABLE IF NOT EXISTS creations (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                prompt TEXT NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                publish BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Creations table created');

        console.log('\n🎉 Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    }
}

setupDatabase();
