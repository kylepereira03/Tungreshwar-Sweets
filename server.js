require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DB_KEY
});
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Input validation middleware
const validateSignupInput = (req, res, next) => {
    const { username, email, password, phone, } = req.body;

    if (!username || !email || !password || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    next();
};

// Signup endpoint
app.post('/api/signup', validateSignupInput, async (req, res) => {
    const { username, email, password, phone } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, phone, created_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, username, email, phone, created_at, updated_at`,
            [username, email, hashedPassword, phone]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: result.rows[0].id, username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0],
            token
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password' });
    }

    try {
        // Find user by email instead of username
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                updated_at: user.updated_at,
                last_login: user.last_login
            },
            token
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, phone, created_at, updated_at, last_login FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', authenticateToken, async (req, res) => {
    res.json({ message: 'Logout successful' });
});

// Update user details endpoint
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash the new password if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        }

        // Update user details
        const result = await pool.query(
            `UPDATE users SET username = $1, email = $2, phone = $3, password_hash = COALESCE($4, password_hash), updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING id, username, email, phone, created_at, updated_at, last_login`,
            [username, email, phone, hashedPassword, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Store order history endpoint
app.post('/api/order-history', authenticateToken, async (req, res) => {
    const { order_date, total_amount, delivery_address, items } = req.body;

    if (!order_date || !total_amount || !delivery_address || !items) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO order_history (user_id, order_date, total_amount, delivery_address, items)
             VALUES ($1, $2, $3, $4, $5) RETURNING order_id`,
            [req.user.userId, order_date, total_amount, delivery_address, JSON.stringify(items)]
        );

        res.status(201).json({ message: 'Order history stored successfully', order_id: result.rows[0].order_id });
    } catch (err) {
        console.error('Error storing order history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});