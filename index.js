const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware'); // استيراد مكتبة البروكسي

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// إعداد CORS
const corsOptions = {
  origin: 'https://camio.vercel.app', // السماح بالنطاق الخاص بك فقط
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public' )));

// إعداد بروكسي للطلبات
app.use(
  '/proxy-send-code',
  createProxyMiddleware({
    target: 'https://camio-k8acpwx1x-jionbofis-projects.vercel.app', // عنوان الخادم الفعلي
    changeOrigin: true,
    pathRewrite: { '^/proxy-send-code': '/send-code' }, // إعادة كتابة المسار
  })
);

// خدمة إرسال رمز التحقق
let sentVerificationCode = null;

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '8080c0001@smtp-brevo.com',
    pass: 'LxpFwhNdtqBngfKV',
  },
});

app.get('/', (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running and accessible at http://localhost:${port}`);
});








