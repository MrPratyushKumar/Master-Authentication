backend/
├── controllers/
│   └── auth.controller.js     ← all auth logic
├── db/
│   └── connectDB.js           ← MongoDB connection
├── mailtrap/
│   ├── mailtrap.config.js     ← Nodemailer + Mailtrap SMTP
│   ├── emails.js              ← all email functions
│   └── emailTemplates.js      ← HTML email templates
├── middleware/
│   └── verifyToken.js         ← JWT protection middleware
├── models/
│   └── user.model.js          ← User schema
├── routes/
│   └── auth.routes.js         ← all routes
├── utils/
│   ├── generateVerificationCode.js
│   └── generateTokenAndSetCookie.js
└── index.js                   ← server entry point