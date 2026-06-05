const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'KatariX_Secured_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Setup (Neon PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for serverless Neon databases
    }
});

// Initialize database schema
async function initDatabase() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS inquiries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                service VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log('Database initialized: "inquiries" table is ready.');
    } catch (err) {
        console.error('Failed to initialize database table:', err);
    }
}

// Check database connection and initialize
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client from database pool:', err.stack);
        console.warn('Backend running without database connectivity. Check your DATABASE_URL environment variable.');
    } else {
        console.log('Successfully connected to Neon PostgreSQL Database.');
        release();
        initDatabase();
    }
});

// API Routes

// 1. Submit a Customer Inquiry
app.post('/api/inquiries', async (req, res) => {
    const { name, email, service, message } = req.body;

    // Server-side validation
    if (!name || !email || !service || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const insertQuery = `
            INSERT INTO inquiries (name, email, service, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [name, email, service, message]);
        
        return res.status(201).json({
            message: 'Inquiry submitted successfully!',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error inserting inquiry into database:', err);
        return res.status(500).json({ message: 'Internal server error while saving data.' });
    }
});

// 2. Fetch all Inquiries (Admin View, protected by passcode)
app.get('/api/inquiries', async (req, res) => {
    const clientPasscode = req.headers['x-admin-passcode'];

    // Verify passcode
    if (!clientPasscode || clientPasscode !== ADMIN_PASSCODE) {
        return res.status(401).json({ message: 'Unauthorized. Invalid passcode.' });
    }

    try {
        const selectQuery = `
            SELECT id, name, email, service, message, created_at
            FROM inquiries
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(selectQuery);
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error retrieving inquiries from database:', err);
        return res.status(500).json({ message: 'Internal server error while fetching data.' });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send('KATARIx API Server is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
