const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
// Import handlers from api folder
const contactHandler = require('./api/contact');
const helloHandler = require('./api/hello');
const messagesHandler = require('./api/messages');

// Helper to wrap Vercel-style handlers for Express
const vercelToExpress = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

app.post('/api/contact', vercelToExpress(contactHandler));
app.get('/api/hello', vercelToExpress(helloHandler));
app.get('/api/messages', vercelToExpress(messagesHandler));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
