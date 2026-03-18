# 🔒 Billify Security Guide: Environment Variables

## Overview
This guide walks you through secure configuration of API keys and secrets in your Billify project.

## ⚠️ CRITICAL FIRST STEP: Regenerate All Exposed Keys

Since you've exposed keys to GitHub, **you MUST regenerate them immediately**:

### 1. **Firebase API Keys** (Front-end)
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project (billify-37eba)
- Settings → Project settings → Your apps
- **Regenerate** or create new API key in "API keys" section
- Update your new key in `.env.development` and `.env` (local files only)

### 2. **MongoDB Connection String** (Backend)
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Change your database user password
- Generate a new connection string
- Update `MONGO_URI` in `.env` file

### 3. **JWT Secret** (Backend)
- Generate new secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Update `JWT_SECRET` in `.env` file

### 4. **Razorpay Keys** (Backend)
- Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
- Regenerate test API keys
- Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` file

---

## 📁 Project Structure

### Frontend (Expo/React Native)
```
Billify_demo/
├── .env                 # ← NEVER commit (already in .gitignore)
├── .env.development     # ← NEVER commit (already in .gitignore)
├── .env.example         # ✅ Safe to commit (template only)
├── app.json             # ← Now uses $EXPO_PUBLIC_* placeholders
└── app/
    └── config/
        └── firebase.ts  # ✅ Uses process.env safely
```

### Backend (Node.js/Express)
```
billify-backend/
├── .env                 # ← NEVER commit (already in .gitignore)
├── .env.example         # ✅ Safe to commit (template only)
├── server.js            # ✅ Already has require('dotenv').config()
└── src/
    ├── config/
    │   └── db.js        # ✅ Uses process.env.MONGO_URI safely
    └── routes/          # ✅ Controllers use process.env for secrets
```

---

## 🚀 Setup Instructions

### Frontend Setup

1. **Copy .env from template (LOCAL ONLY):**
   ```bash
   cd Billify_demo
   cp .env.example .env.development
   # or .env for production
   ```

2. **Fill in actual values:**
   ```bash
   # .env.development
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCL4ULn... (your new key)
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=billify-37eba.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=billify-37eba
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=billify-37eba.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=142514767464
   EXPO_PUBLIC_FIREBASE_APP_ID=1:142514767464:web:f04ee859395cc7eb941ddd
   EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

3. **Verify firebase.ts is using environment variables:**
   ```typescript
   // ✅ GOOD - Uses process.env
   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || ""
   ```

### Backend Setup

1. **Copy .env from template (LOCAL ONLY):**
   ```bash
   cd billify-backend
   cp .env.example .env
   ```

2. **Fill in actual values:**
   ```bash
   # .env
   PORT=5000
   NODE_ENV=development
   
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/billify
   JWT_SECRET=your_new_generated_secret_min_32_chars
   
   RAZORPAY_KEY_ID=rzp_test_your_new_key
   RAZORPAY_KEY_SECRET=your_new_secret_key
   ```

3. **Verify dotenv is loaded (already done in server.js):**
   ```javascript
   // server.js - Line 1
   require('dotenv').config(); // ✅ Already configured
   ```

4. **Access secrets in code:**
   ```javascript
   // ✅ GOOD - Use process.env
   const mongoUri = process.env.MONGO_URI;
   const jwtSecret = process.env.JWT_SECRET;
   const razorpayKey = process.env.RAZORPAY_KEY_ID;
   const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
   ```

---

## ✅ Safe Way to Use Environment Variables

### Node.js/Express Backend

```javascript
// ✅ GOOD - Access at runtime
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// ✅ GOOD - Use with validation
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ❌ NEVER - Hardcode secrets
const jwtSecret = 'your_secret_here'; // BAD!

// ❌ NEVER - Log secrets
console.log('JWT_SECRET:', process.env.JWT_SECRET); // BAD!
```

### Example: Express Middleware Using JWT Secret

```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // ✅ GOOD - Use from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
```

### Example: Creating JWT Token

```javascript
// src/services/auth.service.js
const jwt = require('jsonwebtoken');

const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET, // ✅ From environment
    { expiresIn: '7d' }
  );
};

module.exports = { createToken };
```

### React Native/Expo Frontend

```javascript
// ✅ GOOD - Already configured in firebase.ts
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  // ... other config
};

// ✅ Usage in components
import { auth } from "../config/firebase";

// React component accessing safe API endpoint
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const response = await fetch(`${API_URL}/auth/login`, {...});
```

---

## 🛡️ Security Checklist

- [ ] ✅ Regenerated all exposed Firebase API keys
- [ ] ✅ Regenerated MongoDB password
- [ ] ✅ Generated new JWT secret
- [ ] ✅ Regenerated Razorpay keys
- [ ] ✅ Created `.env` files (local only, NEVER committed)
- [ ] ✅ Created `.env.example` files (safe templates)
- [ ] ✅ Verified `.gitignore` includes `.env*` files
- [ ] ✅ Code uses `process.env` for all secrets
- [ ] ✅ No console.log of secrets
- [ ] ✅ All environment variables documented in `.env.example`

---

## 🔄 GitHub History Cleanup (IMPORTANT!)

Even though `.env` is now in `.gitignore`, the exposed keys are still in your GitHub history!

### Option 1: Remove From History (LOCAL FILES ONLY)
```bash
# Install BFG Repo-Cleaner
npm install -g bfg

# Remove .env files from history
bfg --delete-files .env

# Push cleaned history
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force-with-lease
```

### Option 2: Contact GitHub Security
- GitHub detects exposed keys automatically
- They may already have disabled them or will notify you
- Go to https://github.com/settings/security

---

## 📚 Environment Variable Best Practices

### Do's ✅
- Keep `.env.example` with placeholder values
- Add comments explaining what each variable is
- Use validation to ensure required vars exist
- Regenerate secrets when exposed
- Use different secrets for dev/staging/production
- Store secrets in CI/CD environment variables

### Don'ts ❌
- Never commit `.env` files
- Never log secret values
- Never include secrets in comments
- Never use same secret for multiple environments
- Never share `.env` files via email/Slack
- Never push secrets to any branch

---

## 🚨 Production Deployment

### For AWS/Heroku/Render/Railway:

1. **Do NOT upload `.env` files**
2. **Set environment variables in platform settings:**
   - Heroku: Settings → Config Vars
   - AWS: Systems Manager → Parameter Store
   - Render: Environment tab
   - Railway: Variables tab

3. **Example (Heroku):**
   ```bash
   heroku config:set MONGO_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your_secret
   heroku config:set RAZORPAY_KEY_ID=rzp_live_...
   heroku config:set RAZORPAY_KEY_SECRET=...
   ```

4. **Verify in deployment:**
   ```bash
   heroku config  # See all vars (values hidden)
   ```

---

## 🆘 Troubleshooting

### Issue: "MONGO_URI is undefined"
```bash
# Check if .env file exists
cat billify-backend/.env

# Check if dotenv is installed
npm list dotenv

# Verify require('dotenv').config() is at top of server.js
head -n 5 billify-backend/server.js
```

### Issue: "Firebase config not loading"
```bash
# Check if .env file exists
cat .env.development

# Check for syntax errors
grep EXPO_PUBLIC .env*

# Verify app.json uses placeholders, not hardcoded values
grep apiKey app.json
```

### Issue: "process.env returns undefined"
- Ensure the variable is PREFIXED with `EXPO_PUBLIC_` for frontend
- Ensure `.env` file is in correct directory
- Restart your dev server after adding variables
- Clear node_modules cache: `npm cache clean --force`

---

## 📋 Reference

- [dotenv NPM Package](https://www.npmjs.com/package/dotenv)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Node.js process.env](https://nodejs.org/en/learn/how-to-read-environment-variables-from-nodejs)
- [OWASP Secrets Management](https://owasp.org/www-community/Secrets_Management)

---

Last Updated: March 18, 2026
