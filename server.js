const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_inquiries';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Schema and Model
const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

// Endpoints
// POST: Save inquiry
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newInquiry = new Inquiry({ name, email, message });
        await newInquiry.save();

        console.log(`New inquiry saved to MongoDB from ${name}`);
        res.status(200).json({ success: true, message: 'Inquiry saved successfully' });
    } catch (error) {
        console.error('Error saving to MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: List insights (for dashboard)
app.get('/api/messages', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ date: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching from MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
