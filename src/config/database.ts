import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const conn = process.env.DATABASE_URL!;
const pool = new Pool({
    connectionString: conn
})

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log("Connected to PostgreSQL database successfully!");
        client.release();
    } catch (err) {
        console.error("Failed to connect to PostgreSQL database:", err);
    } finally {
        pool.end();
    }
};

// testConnection();

export default pool;
