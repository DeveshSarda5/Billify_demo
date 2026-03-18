# 🔒 MongoDB Security Configuration

## Overview
This document outlines how MongoDB credentials are securely managed in the Billify backend.

## Security Best Practices Implemented

### 1. ✅ Environment Variables
- **File**: `.env` (NOT committed to git)
- **Protected by**: `.gitignore`
- **Variable**: `process.env.MONGO_URI`

### 2. ✅ Connection Code
- **File**: `src/config/db.js`
- **Usage**: `mongoose.connect(process.env.MONGO_URI)`
- **Validation**: Fails immediately if `MONGO_URI` is missing

```javascript
// ✅ SECURE - Uses environment variable
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');
};
```

### 3. ✅ Configuration Files

#### `.env` (Local - NEVER committed)
```env
MONGO_URI=mongodb://localhost:27017/billify
        # OR for MongoDB Atlas:
        # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/billify
```

#### `.env.example` (Template - SAFE to commit)
```env
MONGO_URI=your_mongodb_connection_string_here
# For local MongoDB:
#   MONGO_URI=mongodb://localhost:27017/billify
#
# For MongoDB Atlas:
#   MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/billify
```

#### `.gitignore` (Protection)
```
.env
.env.local
.env.*.local
```

### 4. ✅ Safe Error Handling
- Connection errors logged without exposing credentials
- Stack traces only shown in development mode

## Setup Instructions

### 1. Create `.env` file from template
```bash
cd billify-backend
cp .env.example .env
```

### 2. Fill in actual MongoDB URI
```bash
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/billify

# For MongoDB Atlas (recommended for production):
# 1. Go to: https://www.mongodb.com/cloud/atlas
# 2. Create a cluster
# 3. Get connection string from: Clusters → Connect → Connect Your Application
# 4. Add username and password
# 5. Replace DATABASE_NAME with your database name
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/billify
```

### 3. Verify it works
```bash
npm start
# Should see: ✅ MongoDB Connected
```

## Security Checklist

- [ ] ✅ `.env` file is in `.gitignore`
- [ ] ✅ `.env` never committed to git
- [ ] ✅ `.env.example` contains only placeholder values
- [ ] ✅ Code uses `process.env.MONGO_URI` only
- [ ] ✅ No hardcoded credentials anywhere
- [ ] ✅ Connection validation implemented
- [ ] ✅ Error logs don't expose credentials
- [ ] ✅ MongoDB Atlas user has minimum required permissions

## MongoDB Atlas Security

### User Permissions
When creating MongoDB Atlas database user, use **minimal permissions**:

✅ **Good**: Database owner for `billify` database only
❌ **Bad**: Admin or superuser permissions

### Network Access
- Whitelist IP addresses in MongoDB Atlas
- Use VPN for production access
- Avoid 0.0.0.0/0 (all IPs) in production

### Credentials
- Use strong passwords (min 16 characters with special chars)
- Store credentials in `.env` file (NOT in code)
- Regenerate credentials if exposed

## Troubleshooting

### Error: "Cannot connect to MongoDB"
```
Cause: MONGO_URI not set or incorrect
Solution:
  1. Verify .env file exists: ls -la .env
  2. Check connection string: echo $MONGO_URI
  3. Verify credentials in MongoDB Atlas
  4. Test local MongoDB: mongosh mongodb://localhost:27017
```

### Error: "Authentication failed"
```
Cause: Wrong username/password in MONGO_URI
Solution:
  1. Go to MongoDB Atlas → Database Access
  2. Regenerate password if needed
  3. Update .env file
  4. Don't include special characters in password without URL encoding
  5. Test connection manually
```

## Git History Cleanup

If MongoDB credentials were exposed in previous commits:

```bash
# Install BFG Repo-Cleaner
npm install -g bfg

# Remove .env files from history
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (only if alone on the repo)
git push origin --force-with-lease
```

## Related Files
- `db.js` - Database connection code
- `server.js` - Server initialization with dotenv
- `.env` - Local credentials (git-ignored)
- `.env.example` - Template (safe to commit)

## References
- [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Atlas Setup](https://docs.mongodb.com/cloud/atlas/getting-started/)
- [dotenv Package](https://www.npmjs.com/package/dotenv)
- [OWASP - Secrets Management](https://owasp.org/www-community/Secrets_Management)

---
Last Updated: March 18, 2026
