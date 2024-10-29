require('dotenv').config(); // Add this line at the top of your script.js


// script.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/workspaces/marketplace/public'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
    }
});
const upload = multer({ storage: storage });

app.post('/submit-order', upload.single('proofOfPurchase'), (req, res) => {
    console.log('Received form submission');
    console.log('Body:', req.body); // Log form data
    console.log('File:', req.file); // Log file info

    const orderNumber = req.body.orderNumber || 'undefined';
    const orderTotal = req.body.orderTotal || 'undefined';
    const paypalAddress = req.body.paypalAddress || 'undefined';

    // Log the values to see if they're undefined
    console.log('Order Number:', orderNumber);
    console.log('Order Total:', orderTotal);
    console.log('PayPal Address:', paypalAddress);

    if (!orderNumber || !orderTotal || !paypalAddress || !req.file) {
        return res.status(400).send('Missing required fields');
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Use environment variables for security
            pass: process.env.GMAIL_PASS   // Use environment variables for security
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'roitblateli@gmail.com', // Replace with recipient's email
        subject: 'New Order Submission',
        text: `Order Number: ${orderNumber}\nOrder Total: ${orderTotal}\nPayPal Address: ${paypalAddress}\nProof of Purchase: ${req.file.path}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent: ', info.response); // Log email send success
        res.send('Order submitted successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
