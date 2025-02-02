const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'sumesh2003nov5@gmail.com', // Your email address
            subject: `New Contact Form Message from ${name}`,
            html: `
                <h3>New Contact Form Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Try different ports if the default is in use, but stay within range
const tryPort = (startPort, maxRetries = 10) => {
    if (startPort > 65535) {
        console.error("No available ports. Exiting...");
        process.exit(1);
    }

    const server = app.listen(startPort, () => {
        console.log(`✅ Server running on port ${startPort}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' && maxRetries > 0) {
            console.warn(`⚠️ Port ${startPort} is busy, trying ${startPort + 1}`);
            tryPort(startPort + 1, maxRetries - 1);
        } else {
            console.error('❌ Server error:', err);
        }
    });
};

// Start server with an initial port
const initialPort = parseInt(process.env.PORT) || 3001;
tryPort(initialPort);
