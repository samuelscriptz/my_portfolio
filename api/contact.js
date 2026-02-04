const mongoose = require('mongoose');
const { Resend } = require('resend');

// Schema and Model (Shared)
const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

// Connection Caching
let cachedDb = null;
const resend = new Resend(process.env.RESEND_API_KEY);

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }

    // Connect without deprecated options
    const db = await mongoose.connect(MONGODB_URI);
    cachedDb = db;
    return db;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 1. Save to MongoDB
        const newInquiry = new Inquiry({ name, email, message });
        await newInquiry.save();

        // 2. Send Email via Resend (Optimistic - don't block success if email fails)
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || email; // Fallback to sender for testing
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'Portfolio Lead <onboarding@resend.dev>',
                    to: ADMIN_EMAIL,
                    subject: `[PORTFOLIO LEAD] New Message from ${name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #00ffd5; border-radius: 10px; max-width: 600px;">
                            <h2 style="color: #00ffd5; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Inquiry Received</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                                <p><strong>Message:</strong></p>
                                <p style="white-space: pre-wrap;">${message}</p>
                            </div>
                            <p style="font-size: 0.8rem; color: #999; margin-top: 30px;">Sent from your Portfolio Dashboard</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // We don't throw error to the user since DB save worked
            }
        }

        res.status(200).json({ success: true, message: 'Inquiry saved successfully' });
    } catch (error) {
        console.error('Error saving to MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
