const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT ||3000; // Render قد تستخدم المنفذ 10000
app.use(express.static(path.join(__dirname, 'index.html')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let sentVerificationCode = null;

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.get('/test', (req, res) => {
    res.send('<h1>Welcome to the Verification Code API!</h1>');
});

app.post('/send-code', (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    sentVerificationCode = verificationCode;

    const mailOptions = {
        from: 'jionbofi@gmail.com',
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Email send error:', err);
            return res.status(500).send({ message: 'Failed to send email. Please try again later.' });
        }
        res.status(200).send({ message: 'Verification code sent successfully!', info });
    });
});

app.post('/verify-code', (req, res) => {
    const { verificationCode } = req.body;
    if (verificationCode == sentVerificationCode) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(3000|process.env.PORT, () => {
    console.log(`Server is running and accessible at https://eager-lofty-mimosa.glitch.me/test:${port}`);
});





