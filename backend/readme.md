# 🔐 Master Authentication — Backend

> **Complete beginner's guide** to the authentication backend built with Express.js, MongoDB, JWT, and Mailtrap.

---

## 📋 Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Folder Structure](#2-folder-structure)
3. [Technology Glossary](#3-technology-glossary)
4. [How The Auth Flow Works — Diagrams](#4-how-the-auth-flow-works--diagrams)
5. [Every File Explained](#5-every-file-explained)
6. [Every API Endpoint](#6-every-api-endpoint)
7. [Environment Variables](#7-environment-variables-env)
8. [How To Run The Project](#8-how-to-run-the-project)
9. [Security Decisions Explained](#9-security-decisions-explained)
10. [Common Errors & Fixes](#10-common-errors--fixes)

---

## 1. What Is This Project?

This is a **complete authentication backend** — the part of a web app that handles who you are, whether you're allowed in, and how to recover your account.

### 🏢 Think of it like a building's security system

| Auth Feature | Real World Analogy |
|---|---|
| Signup | Filling out a form to get a key card |
| Email verification | Security office calls you to confirm you're real |
| Login | Swiping your key card at the door |
| JWT cookie | The key card itself stored in your wallet |
| Logout | Handing the key card back |
| Forgot password | Calling security to issue a new key card |
| checkAuth | The door scanner checking your card is still valid |

> 💡 **Simple rule:** This backend does NOT build any pages. It only responds to requests with JSON data. Your frontend (React, etc.) will call these endpoints.

---

## 2. Folder Structure

Every folder has **one job**. This is called **separation of concerns** — keeping related code together so it's easy to find and change.

```
backend/
├── index.js                         ← The front door. Starts the server.
├── .env                             ← Secret keys. NEVER share or commit this file!
│
├── controllers/
│   └── auth.controller.js           ← All the logic: what happens on each request
│
├── db/
│   └── connectDB.js                 ← Connects to MongoDB database
│
├── mailtrap/
│   ├── mailtrap.config.js           ← Email server (SMTP) settings
│   ├── emails.js                    ← Functions to send each type of email
│   └── emailTemplates.js            ← The actual HTML designs of emails
│
├── middleware/
│   └── verifyToken.js               ← Security guard — checks JWT before private routes
│
├── models/
│   └── user.model.js                ← Defines what a User looks like in the database
│
├── routes/
│   └── auth.routes.js               ← Maps URLs to controller functions
│
└── utils/
    ├── generateVerificationCode.js  ← Makes the 6-digit email code
    └── generateTokenAndSetCookie.js ← Creates JWT and stores it as a cookie
```

---

## 3. Technology Glossary

Every technical term used in this project, explained in plain English.

### ⚙️ Core Technologies

| Term | Simple Explanation |
|---|---|
| **Node.js** | JavaScript that runs on your computer (server), not in a browser. Like a chef working in the kitchen vs a waiter at the table. |
| **Express.js** | A framework built on Node.js that makes it easy to create routes and handle requests. Think of it as the restaurant's order management system. |
| **MongoDB** | A database that stores data as JSON-like documents instead of tables. Like storing notes in a folder instead of a spreadsheet. |
| **Mongoose** | A helper library that makes talking to MongoDB easier. It adds rules (schemas) so your data is always in the right shape. |
| **dotenv** | A library that loads secret values from your `.env` file into `process.env` so your code can use them. |
| **nodemon** | A dev tool that automatically restarts your server every time you save a file. |

### 🔐 Authentication & Security Terms

| Term | Simple Explanation |
|---|---|
| **JWT** | JSON Web Token. A small encoded string that proves who you are. Like a wristband at a festival — once you have it, you don't need to show your ticket again. |
| **Cookie (httpOnly)** | A small file stored in your browser. `httpOnly` means JavaScript on the page can't read it — only the server can. Prevents hackers from stealing it. |
| **bcrypt** | A tool that turns your password into a scrambled string (hash). Even if a hacker gets your database, they can't reverse it back to the real password. |
| **Hash** | A one-way transformation. `password123` → `$2b$10$xyz...`. You can never go backwards. Comparing hashes is how login works. |
| **Salt** | A random string added to your password before hashing. Makes every hash unique even if two users have the same password. |
| **Middleware** | Code that runs in the middle of a request — between the request arriving and the response being sent. Like airport security between check-in and boarding. |
| **Verification Token** | The 6-digit code emailed to you on signup. Proves you own that email address. |
| **Reset Token** | A long random string emailed to you for password reset. Only valid for 1 hour and deleted after use. |
| **CSRF** | Cross-Site Request Forgery — a type of attack. The `sameSite: 'strict'` cookie setting protects against it. |
| **XSS** | Cross-Site Scripting — when a hacker injects JavaScript into your page. `httpOnly` cookies protect against token theft via XSS. |

### 📧 Email Terms

| Term | Simple Explanation |
|---|---|
| **Mailtrap** | A fake email inbox for developers. Catches all emails your app sends during testing so real users never get spammed by accident. |
| **SMTP** | Simple Mail Transfer Protocol. The rules computers use to send emails. Like the postal system's rulebook. |
| **Nodemailer** | A Node.js library that sends emails using SMTP. You give it: who to send to, subject, and HTML — it handles the rest. |
| **Sandbox mode** | Mailtrap's testing mode. Emails go to your Mailtrap inbox, NOT to real email addresses. Safe for development. |
| **Email template** | The HTML design of the email. Uses `{placeholders}` that get replaced with real values before sending. |
| **Transporter** | The Nodemailer object configured with your SMTP settings. You call `.sendMail()` on it to send an email. |

---

## 4. How The Auth Flow Works — Diagrams

### 🟢 Signup + Email Verification Flow

```
User sends: name, email, password
         ↓
Validate all fields (not empty, email format, password ≥ 8 chars)
         ↓
Check MongoDB — does this email already exist?
         ↓
Hash the password with bcrypt (NEVER store plain text!)
         ↓
Generate 6-digit verification code
         ↓
Save new user to MongoDB  →  isVerified: false
         ↓
Generate JWT and set as httpOnly cookie
         ↓
Send verification email via Mailtrap SMTP
         ↓
Return success response (password hidden from response)
```

---

### 🔵 Verify Email Flow

```
User enters 6-digit code from Mailtrap inbox
         ↓
Find user in MongoDB where verificationToken matches AND not expired
         ↓
      Found?
     ↙      ↘
   NO         YES
   ↓           ↓
Return 400   Set isVerified: true
             Clear verificationToken fields
             Save user
             Send welcome email
             Return success ✅
```

---

### 🟡 Login Flow

```
User sends: email, password
         ↓
Find user in MongoDB by email
         ↓
Compare password with bcrypt hash
         ↓
Is isVerified true?  →  NO  →  Return 403 (verify email first)
         ↓ YES
Generate new JWT and set cookie
         ↓
Update lastLogin timestamp
         ↓
Return user data (password hidden) ✅
```

---

### 🟠 Forgot Password Flow

```
User sends: email address
         ↓
Find user in MongoDB
         ↓
User not found?  →  Return same success message (prevent user enumeration)
         ↓ Found
Generate 40-char crypto random reset token
         ↓
Save token + 1 hour expiry to user in DB
         ↓
Build reset URL:  CLIENT_URL/reset-password/TOKEN
         ↓
Send password reset email via Mailtrap
         ↓
Return generic success message ✅
```

---

### 🔴 Reset Password Flow

```
Token comes from URL param, new password from request body
         ↓
Find user where resetPasswordToken matches AND not expired
         ↓
      Found?
     ↙      ↘
   NO         YES
   ↓           ↓
Return 400   Hash new password with bcrypt
             Save new password
             Clear resetPasswordToken fields
             Send "password reset successful" email
             Return success ✅
```

---

### 🟣 checkAuth Flow (Protected Route)

```
Browser sends request — JWT cookie sent automatically
         ↓
verifyToken MIDDLEWARE runs first
         ↓
Read req.cookies.token
         ↓
jwt.verify(token, JWT_SECRET)
         ↓
      Valid?
     ↙      ↘
   NO         YES
   ↓           ↓
  401        Attach req.userId = decoded.userid
             Call next() → pass to checkAuth handler
                  ↓
             Find user in DB by req.userId
             Return user object (password excluded) ✅
```

---

## 5. Every File Explained

### `index.js` — The Server Entry Point

> The very first file Node.js runs. Think of it as turning the key to start a car.

**What it does:**
- Loads all environment variables from `.env` using `dotenv`
- Creates the Express app
- Adds middleware: `express.json()` to read request bodies, `cookieParser()` to read cookies
- Registers all routes under `/api/auth`
- Starts listening on PORT 5000
- Connects to MongoDB

> ⚠️ **Why `dotenv.config()` must be first?**
> If any other import runs before `dotenv.config()`, all `process.env` variables will be `undefined`. Always put it on line 1.

---

### `models/user.model.js` — The User Blueprint

> A Mongoose schema is like a form template. It defines exactly what fields every user must have.

| Field | Type | What it stores |
|---|---|---|
| `email` | String | User's email — must be unique |
| `password` | String | bcrypt hashed password — never plain text |
| `name` | String | User's display name |
| `isVerified` | Boolean | `false` until email is verified |
| `verificationToken` | String | 6-digit code sent to email on signup |
| `verificationTokenExpiresAt` | Date | When the 6-digit code expires (24h) |
| `resetPasswordToken` | String | Crypto token for password reset link |
| `resetPasswordExpiresAt` | Date | When reset link expires (1 hour) |
| `lastLogin` | Date | Timestamp of most recent login |

The `{ timestamps: true }` option automatically adds `createdAt` and `updatedAt` to every document.

---

### `controllers/auth.controller.js` — The Brain

> Contains all the business logic. Routes are thin — they just call these functions.

| Function | What it does |
|---|---|
| `signup` | Validates input, hashes password, saves user, sends verification email |
| `verifyEmail` | Checks 6-digit code, marks user verified, sends welcome email |
| `login` | Validates credentials, blocks unverified users, sets JWT cookie |
| `logout` | Clears the JWT cookie |
| `forgotPassword` | Generates reset token, saves to DB, sends reset email |
| `resetPassword` | Validates token, hashes new password, clears token fields |
| `checkAuth` | Returns current user (used after verifyToken middleware) |

---

### `middleware/verifyToken.js` — The Security Guard

> Runs before any protected route. Checks the JWT cookie and attaches `userId` to the request.

**How it works step by step:**
1. Read `req.cookies.token` — the JWT cookie set during login
2. If no cookie → return `401 Unauthorized` immediately
3. `jwt.verify(token, JWT_SECRET)` → decode and validate the token
4. If invalid or expired → return `401 Unauthorized`
5. If valid → set `req.userId = decoded.userid`
6. Call `next()` → pass control to the actual route handler

> 💡 By attaching `userId` to the request object, the next handler (`checkAuth`) knows which user to look up in MongoDB without needing another login.

---

### `routes/auth.routes.js` — The URL Map

> Thin file. Just maps each URL + HTTP method to the right controller function.

```js
router.get("/check-auth", verifyToken, checkAuth);
//                         ↑                ↑
//               middleware runs first   then this runs
```

The `verifyToken` in the middle is **middleware chaining** — it runs before `checkAuth`.

---

### `mailtrap/mailtrap.config.js` — Email Server Setup

> Configures Nodemailer to connect to Mailtrap's SMTP server.

**Dev vs Production — just change `.env`, zero code changes needed:**

| Variable | Development | Production |
|---|---|---|
| `SMTP_HOST` | `sandbox.smtp.mailtrap.io` | `live.smtp.mailtrap.io` |
| `SMTP_PORT` | `2525` | `587` |
| Where emails go | Your Mailtrap inbox | Real user inboxes |

---

### `utils/generateTokenAndSetCookie.js` — JWT Maker

> Creates a JWT and stores it as a secure httpOnly cookie in the browser.

**Cookie settings explained:**

| Setting | Value | Why |
|---|---|---|
| `httpOnly: true` | always | JS in browser cannot read this cookie → prevents XSS |
| `secure: true` | production only | Cookie only sent over HTTPS, never HTTP |
| `sameSite: 'strict'` | always | Cookie only sent to your own domain → prevents CSRF |
| `maxAge` | 7 days | Cookie auto-deletes from browser after 7 days |

---

### `utils/generateVerificationCode.js` — Code Generator

> Generates a random 6-digit number as a string.

```js
Math.floor(100000 + Math.random() * 900000).toString()
// Always gives a number between 100000 and 999999
```

---

## 6. Every API Endpoint

All routes are prefixed with `/api/auth`

| Method | Endpoint | Auth Required? | What it does |
|---|---|---|---|
| `POST` | `/signup` | ❌ No | Create account + send verification email |
| `POST` | `/verify-email` | ❌ No | Verify 6-digit code from email |
| `POST` | `/login` | ❌ No | Login + set JWT cookie |
| `POST` | `/logout` | ❌ No | Clear JWT cookie |
| `POST` | `/forgot-password` | ❌ No | Send password reset link to email |
| `POST` | `/reset-password/:token` | ❌ No | Reset password using token from email |
| `GET` | `/check-auth` | ✅ YES (JWT) | Return current logged-in user |

---

### Request & Response Examples

#### `POST /api/auth/signup`
```json
// Request body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Success response (201)
{
  "success": true,
  "message": "User created successfully. Please verify your email.",
  "user": { "_id": "...", "email": "john@example.com", "isVerified": false }
}
```

#### `POST /api/auth/verify-email`
```json
// Request body (code from Mailtrap inbox)
{ "code": "142425" }

// Success response (200)
{ "success": true, "message": "Email verified successfully", "user": { "isVerified": true } }
```

#### `POST /api/auth/login`
```json
// Request body
{ "email": "john@example.com", "password": "password123" }

// Success (200)
{ "success": true, "message": "Logged in successfully", "user": { ... } }

// Not verified (403)
{ "success": false, "message": "Please verify your email before logging in" }

// Wrong credentials (400)
{ "success": false, "message": "Invalid credentials" }
```

#### `POST /api/auth/forgot-password`
```json
// Request body
{ "email": "john@example.com" }

// Response (200) — same whether email exists or not
{ "success": true, "message": "If that email exists, a reset link has been sent" }
```

#### `POST /api/auth/reset-password/:token`
```json
// Request body (token comes from the URL param)
{ "password": "newpassword123" }

// Success (200)
{ "success": true, "message": "Password reset successfully" }
```

#### `GET /api/auth/check-auth`
```json
// No body needed — JWT cookie sent automatically by browser

// Success (200)
{
  "success": true,
  "user": { "_id": "...", "email": "john@example.com", "isVerified": true }
}

// Not logged in (401)
{ "success": false, "message": "Unauthorized - no token provided" }
```

---

## 7. Environment Variables (.env)

> ⚠️ **Never commit `.env` to Git.** Add it to `.gitignore` immediately.

```dotenv
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Server
PORT=5000
NODE_ENV=development

# JWT — use a long random string in production
JWT_SECRET=mySecretKey

# Mailtrap SMTP — dev sandbox
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password

# Frontend URL — used to build password reset links
CLIENT_URL=http://localhost:3000
```

| Variable | What it does |
|---|---|
| `MONGODB_URI` | Full connection string to your MongoDB Atlas database |
| `PORT` | Which port the server listens on |
| `JWT_SECRET` | Secret used to sign JWTs. Must be long and random in production. |
| `NODE_ENV` | `development` or `production`. Enables secure cookies in production. |
| `SMTP_HOST` | Mailtrap sandbox server. Change to `live.smtp.mailtrap.io` for prod. |
| `SMTP_PORT` | Port for SMTP connection (2525 for dev, 587 for prod) |
| `SMTP_USER` | Your Mailtrap SMTP username |
| `SMTP_PASS` | Your Mailtrap SMTP password |
| `CLIENT_URL` | Your frontend URL — used to build password reset links |

---

## 8. How To Run The Project

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up your `.env`
Copy the example above and fill in your real values.

### Step 3 — Run the server
```bash
npm run dev    # development — auto-restarts on file changes
npm start      # production
```

You should see:
```
Server is running on port: 5000
MongoDB Connected: ac-xxxx.mongodb.net
```

### Step 4 — Test with Postman (in this order)
1. `POST /api/auth/signup` → check Mailtrap inbox for 6-digit code
2. `POST /api/auth/verify-email` → use the code from Mailtrap
3. `POST /api/auth/login` → should succeed and set cookie
4. `GET /api/auth/check-auth` → should return your user
5. `POST /api/auth/logout` → clears the cookie
6. `POST /api/auth/forgot-password` → check Mailtrap for reset link
7. `POST /api/auth/reset-password/:token` → use token from email

---

## 9. Security Decisions Explained

| Decision | Why we do it |
|---|---|
| Same error for wrong email AND wrong password | If we said "email not found", hackers could scan which emails are in our DB. Same message = no information leak. |
| Same response for forgot-password whether email exists or not | Prevents attackers from using the forgot-password form to check which emails are registered. |
| bcrypt cost factor 10 | Higher = slower = harder to brute force. Cost 10 takes ~100ms — too slow to crack billions of passwords. |
| `httpOnly` cookie for JWT | JavaScript in the browser can't read httpOnly cookies. Even if a hacker injects JS (XSS), they can't steal your token. |
| Token deleted after one use | If someone intercepts a token, they can't use it again after the real user has. |
| Token expiry times | Verification: 24 hours. Reset: 1 hour. Short enough to limit damage if intercepted. |
| `crypto.randomBytes(20)` for reset token | Truly random — cannot be guessed or predicted. `Math.random()` is NOT cryptographically safe. |
| `.select('-password')` in checkAuth | Never return the password hash — even hashed, there's no reason to expose it. |

---

## 10. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:587` | SMTP env vars not loading | Check `.env` has no spaces around `=`. Ensure `dotenv.config()` is first line in `index.js`. |
| `ENOTFOUND ac-xxx.mongodb.net` | MongoDB Atlas IP not whitelisted | Go to Atlas → Network Access → Add IP → Allow `0.0.0.0/0` |
| `verifyEmail is not defined` | Missing import in routes file | Add `verifyEmail` to the import in `auth.routes.js` |
| `User not found` in checkAuth | Using `decoded.id` instead of `decoded.userid` | Use `decoded.userid` — matches what `generateTokenAndSetCookie` saved |
| `injecting env (0) from .env` | `dotenv.config()` called twice | Remove extra `dotenv.config()` calls, keep only in `index.js` |
| `Invalid or expired code` | Using old verification code | Sign up again with a new email to get a fresh code |
| Reset Password button has no link | `CLIENT_URL` missing from `.env` | Add `CLIENT_URL=http://localhost:3000` to your `.env` |
| `req.cookies` is undefined | `cookie-parser` not installed/added | Run `npm install cookie-parser` and add `app.use(cookieParser())` to `index.js` |

---

## ✅ What You Built — Summary

| Step | Endpoint | Feature |
|---|---|---|
| 1 | `POST /api/auth/signup` | Create account + send Mailtrap verification email |
| 2 | `POST /api/auth/verify-email` | Verify 6-digit code, mark user verified |
| 3 | `POST /api/auth/login` | Login with JWT cookie, block unverified users |
| 4 | `POST /api/auth/logout` | Clear JWT cookie |
| 5a | `POST /api/auth/forgot-password` | Send reset link to email |
| 5b | `POST /api/auth/reset-password/:token` | Reset password using token |
| 6 | `GET /api/auth/check-auth` | Verify JWT and return current user |

---

## 🚀 What To Build Next

- **Frontend** — React login/signup/verify pages that call these APIs
- **Rate limiting** — protect `/signup` and `/forgot-password` from spam using `express-rate-limit`
- **Refresh tokens** — keep users logged in longer with a more secure token rotation system
- **Email resend** — allow users to request a new verification code if theirs expired

---

*Built with ❤️ using Express.js · MongoDB · JWT · Mailtrap · Nodemailer*
