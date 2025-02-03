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
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_APP_PASSWORD // Your app password
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

        // Prepare email content
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Sender's name and your email
            to: 'sumesh2003nov5@gmail.com', // Your email address where messages will be received
            replyTo: email, // Replies will go to the sender's email
            subject: `New Contact Form Message from ${name}`, // Subject of the email
            html: `
                <h2>📩 New Contact Form Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Message:</strong> ${message}</p>
                <hr>
                <p>🔹 This message was sent from your portfolio contact form.</p>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Respond back to the client
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

// Function to handle port conflicts and try different ports if necessary
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
