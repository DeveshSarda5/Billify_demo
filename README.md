# Billify - Bill Tracking & Payment Management

A comprehensive full-stack mobile application for bill tracking, management, and payment processing. Built with React Native/Expo for iOS/Android and Express.js for backend services.

## 📋 Project Overview

Billify is a cross-platform bill management system that helps users track, organize, and pay their bills efficiently. The application provides features for bill scanning, payment management, location-based store selection, and comprehensive billing history tracking.

**Key Use Cases:**
- Scan and store bill receipts with OCR
- Track monthly bill amounts and payment history
- Manage multiple payment methods
- Receive notifications for upcoming payments
- Search and filter bills by date, amount, or store location
- Process payments securely via Razorpay integration

## ✨ Features

### Frontend (Mobile)
- **User Authentication**: Email/password and phone-based authentication via JWT
- **Bill Management**: 
  - Scan receipts and extract bill information
  - View current and previous bills
  - Filter and search bill history
- **Payment Processing**: 
  - Multiple payment method support
  - Razorpay payment gateway integration
  - Payment history and receipts
- **Location Management**: 
  - Store location selector
  - Distance-based store recommendations
  - Location-specific bill tracking
- **User Profile**: 
  - Account settings and profile management
  - Password management
  - Notification preferences
- **Support System**: 
  - Help & support tickets
  - Ticket tracking and status updates

### Backend (API)
- **Authentication**: JWT-based user authentication and authorization
- **Bill Management**: CRUD operations for bills, pagination, and filtering
- **Payment Processing**: Razorpay integration and payment verification
- **Product Inventory**: Store product catalog and management
- **Support Tickets**: Ticket creation, tracking, and status management
- **Database**: MongoDB with Mongoose ODM for data persistence

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT tokens stored locally
- **UI Components**: React Native built-in components
- **Build Tool**: Expo CLI

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Payment Gateway**: Razorpay API
- **Environment**: dotenv for configuration

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Database Hosting**: MongoDB Atlas (cloud) or local MongoDB
- **API Testing**: REST endpoints

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Expo CLI**: `npm install -g expo-cli`
- **Android Emulator** or **iOS Simulator** (for mobile testing)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd billify-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment configuration:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Environment Variables section):
   ```bash
   # Edit .env with your values
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment configuration:**
   ```bash
   cp .env.example .env.development
   ```

4. **Configure environment variables** (see Environment Variables section):
   ```bash
   # Edit .env.development with your backend API URL
   ```

5. **Start the Expo development server:**
   ```bash
   npm start
   ```

6. **Run on emulator:**
   - **Android**: Press `a` in the Expo CLI
   - **iOS**: Press `i` in the Expo CLI

## 🔐 Environment Variables

### Backend (`.env` file)

Create a `.env` file in the `billify-backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/billify

# Authentication
JWT_SECRET=your_secure_jwt_secret_here

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

### Frontend (`.env.development` file)

Create a `.env.development` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://10.10.36.126:5000/api
```

**Note:** Replace `10.10.36.126` with your actual backend server IP address.

### Generating Secrets

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Setting Up MongoDB

#### Local MongoDB:
```env
MONGO_URI=mongodb://localhost:27017/billify
```

#### MongoDB Atlas (Cloud):
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string from the cluster dashboard
3. Add credentials to the connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/billify?retryWrites=true&w=majority
   ```

### Setting Up Razorpay

1. Create or log in to your [Razorpay account](https://razorpay.com)
2. Navigate to Settings → API Keys
3. Copy your Test API Key ID and Secret
4. Add them to your `.env` file

## 📂 Project Structure

```
billify-demo/
├── .env.development              # Frontend environment variables (local)
├── .env.example                  # Frontend environment template
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
├── app.json                      # Expo configuration
├── metro.config.js               # Metro bundler configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
│
├── app/
│   ├── components/               # Reusable React Native components
│   ├── config/                   # Configuration files (API, Firebase)
│   ├── constants/                # Constants (store locations, inventory)
│   ├── context/                  # React Context providers (Auth, Cart, Location)
│   ├── navigation/               # Navigation and routing
│   ├── screens/                  # Screen components
│   ├── services/                 # API and external services
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
│
└── billify-backend/              # Backend server
    ├── .env                      # Backend environment variables (local - not committed)
    ├── .env.example              # Backend environment template
    ├── .gitignore                # Backend-specific git ignore rules
    ├── package.json              # Backend dependencies
    ├── server.js                 # Main server entry point
    ├── seedProducts.js           # Database seeding script
    │
    └── src/
        ├── config/               # Database and configuration
        ├── controllers/          # Route controllers
        ├── middleware/           # Express middleware
        ├── models/               # MongoDB Mongoose models
        ├── routes/               # API routes
        └── utils/                # Utility functions
```

## 🔒 Security Best Practices

### Environment Variables
- **Never commit `.env` files** to version control
- Use `.env.example` as a template for new developers
- Keep all sensitive data (API keys, secrets, database URIs) in `.env`
- Regenerate keys if accidentally exposed

### Git Protection
- `.gitignore` is configured to exclude `.env*` files
- Verify sensitive files are not committed: `git status`

### Database Security
- Use strong passwords for database accounts
- Enable IP whitelisting in MongoDB Atlas
- Use environment variables for all credentials
- Never log sensitive data (credentials, tokens, URIs)

### API Security
- All API endpoints use JWT authentication
- Passwords are hashed before storage
- API keys and secrets are environment-based
- Sensitive operations validate user permissions

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd billify-backend
npm start
```

**Terminal 2 - Start Frontend:**
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

### Building for Production

**Android APK:**
```bash
eas build --platform android --local
```

**iOS:**
```bash
eas build --platform ios --local
```

## 🧪 Testing

### Backend Tests
```bash
cd billify-backend
npm test
```

### Frontend Tests
```bash
npm test
```

## 📝 API Documentation

The backend provides RESTful API endpoints at `/api/*`:

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Bills
- `GET /api/bills` - Get user's bills
- `GET /api/bills/:id` - Get specific bill
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Products & Store
- `GET /api/products` - Get store products
- `GET /api/products/store/:storeId` - Get products by store

### Support
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get user's tickets
- `GET /api/support/tickets/:id` - Get specific ticket

## 🐛 Troubleshooting

### Backend Won't Start
- Ensure MongoDB is running: `mongod`
- Check if port 5000 is available: `netstat -an | findstr :5000`
- Verify `.env` file has all required variables
- Check logs for specific error messages

### Frontend Can't Connect to Backend
- Ensure backend server is running
- Verify `EXPO_PUBLIC_API_BASE_URL` in `.env.development` is correct
- Use correct IP address (not `localhost` for emulator)
- Check firewall isn't blocking port 5000

### MongoDB Connection Issues
- Verify connection string in `.env`
- Ensure MongoDB database user has proper permissions
- Check MongoDB Atlas IP whitelist if using cloud
- Verify database name exists

## 📞 Support & Contribution

For issues, feature requests, or contributions:
1. Create an issue with detailed description
2. Follow the existing code style and structure
3. Submit pull requests for review
4. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Razorpay for payment processing
- MongoDB for database services
- Expo for React Native development
- The open-source community

---

**Last Updated:** March 2026

For the latest information and updates, check the project repository.
