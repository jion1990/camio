const express = require('express');
const path = require('path');

const cors = require('cors');



const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();





// إعداد الخادم
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 5000; // Heroku يقوم بتحديد المنفذ تلقائيًا
app.use(cors());
// Middleware لتفسير البيانات الواردة في الجسم (body)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تخزين رمز التحقق المرسل مؤقتًا
let sentVerificationCode = null; 

// إعداد SMTP باستخدام متغيرات بيئية
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // تستخدم البورت 587 للبروتوكول الغير مشفر
    auth: {
        user: "8080c0001@smtp-brevo.com", // استخدام متغير بيئي
        pass: "LxpFwhNdtqBngfKV", // استخدام متغير بيئي
    },
});

// نقطة النهاية لإرسال رمز التحقق
app.post('/send-code', (req, res) => {
    const { email } = req.body;

    // توليد رمز تحقق عشوائي (ملاحظة: يمكنك استبداله بأي منطق آخر)
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // رمز من 6 أرقام
    sentVerificationCode = verificationCode;  // تخزين الرمز المرسل

    // إعداد البريد الإلكتروني
    const mailOptions = {
        from: "jionbofi@gmail.com", // من البريد الإلكتروني الذي قمت بتوثيقه
        to: email,
        subject: 'رمز التحقق الخاص بك',
        text: `رمز التحقق الخاص بك هو: ${verificationCode}`,
    };

    // إرسال البريد الإلكتروني
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.status(500).send({ message: 'فشل في إرسال البريد الإلكتروني', error: err });
        }
        return res.status(200).send({ message: 'تم إرسال رمز التحقق بنجاح!', info: info });
    });
});

// نقطة النهاية للتحقق من الرمز المدخل
app.post('/verify-code', (req, res) => {
    const { verificationCode } = req.body;

    // التحقق من صحة الرمز
    if (verificationCode == sentVerificationCode) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




