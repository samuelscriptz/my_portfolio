const mongoose = require('mongoose');

// Schema and Model (Shared)
const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(MONGODB_URI);

        const inquiries = await Inquiry.find().sort({ date: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching from MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
