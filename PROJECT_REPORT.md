# Billify — Project Report

> **Self-Checkout & Billing Platform**
> Version 1.0.0 | April 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack Summary](#3-technology-stack-summary)
4. [Backend — Billify API Server](#4-backend--billify-api-server)
5. [Admin Portal — Billify Admin Dashboard](#5-admin-portal--billify-admin-dashboard)
6. [Mobile Application — Billify App](#6-mobile-application--billify-app)
7. [Database Design](#7-database-design)
8. [API Endpoints](#8-api-endpoints)
9. [Authentication & Security](#9-authentication--security)
10. [Payment Integration](#10-payment-integration)
11. [DevOps & Tooling](#11-devops--tooling)
12. [Folder Structure](#12-folder-structure)

---

## 1. Project Overview

**Billify** is a full-stack self-checkout and billing platform designed for retail stores. It enables customers to scan products, generate bills, and make payments directly from their mobile phones — eliminating the need for traditional checkout counters.

The system consists of three interconnected modules:

| Module | Purpose | Platform |
|--------|---------|----------|
| **Backend API** | REST API server handling auth, billing, payments, products & support | Node.js / Express |
| **Admin Portal** | Web dashboard for store managers to manage products, bills, offers & analytics | Next.js (React) |
| **Mobile App** | Customer-facing app for scanning, cart, payment & bill management | React Native / Expo |

---

## 2. System Architecture

```
┌─────────────────────┐      ┌──────────────────────────┐
│   Mobile App        │      │   Admin Portal           │
│   (React Native /   │      │   (Next.js / React)      │
│    Expo)            │      │                          │
└────────┬────────────┘      └────────────┬─────────────┘
         │  REST API (HTTP/HTTPS)          │  REST API
         │                                 │
         ▼                                 ▼
┌──────────────────────────────────────────────────────┐
│                 Billify Backend API                   │
│              (Node.js / Express v5)                   │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ │
│  │   Auth   │ │ Products │ │  Bills  │ │Payments │ │
│  │  Routes  │ │  Routes  │ │ Routes  │ │ Routes  │ │
│  └──────────┘ └──────────┘ └─────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Support  │ │  Admin   │                          │
│  │  Routes  │ │  Routes  │                          │
│  └──────────┘ └──────────┘                          │
└──────────────────────┬───────────────────────────────┘
                       │  Mongoose ODM
                       ▼
              ┌─────────────────┐       ┌──────────────┐
              │   MongoDB Atlas │       │   Razorpay   │
              │   (Database)    │       │   (Payments) │
              └─────────────────┘       └──────────────┘
```

---

## 3. Technology Stack Summary

### Languages

| Language | Used In |
|----------|---------|
| **JavaScript (ES6+)** | Backend API |
| **TypeScript** | Mobile App, Admin Portal |

### Frameworks & Libraries

| Technology | Version | Role |
|------------|---------|------|
| **Node.js** | — | Server runtime |
| **Express.js** | 5.2.1 | Backend REST framework |
| **Next.js** | 16.1.6 | Admin portal (App Router) |
| **React** | 19.2.3 | Admin portal UI |
| **React Native** | 0.81.5 | Mobile app framework |
| **Expo** | 54.0.33 | Mobile build & development toolchain |

### Database

| Technology | Version | Role |
|------------|---------|------|
| **MongoDB** | 7.0 | Primary database |
| **Mongoose** | 9.1.5 | ODM (Object Data Modeling) |
| **MongoDB Memory Server** | 11.0.1 | In-memory DB fallback for development |

### Payments

| Technology | Version | Role |
|------------|---------|------|
| **Razorpay SDK** | 2.9.6 | Payment gateway integration |

### Styling & UI

| Technology | Version | Used In |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Admin portal |
| **Framer Motion** | 12.38.0 | Admin portal animations |
| **Lucide Icons** | 0.577.0 | Admin portal icons |
| **Lucide React Native** | 0.563.0 | Mobile app icons |
| **Rive Animations** | 4.27.3 | Admin portal & mobile splash |
| **Recharts** | 3.8.0 | Admin portal charts & analytics |

### Navigation & State

| Technology | Used In | Role |
|------------|---------|------|
| **React Navigation** | Mobile app | Screen navigation (Native Stack) |
| **React Context API** | Mobile app | Global state management |
| **AsyncStorage** | Mobile app | Local persistent storage |

### Security

| Technology | Version | Role |
|------------|---------|------|
| **JSON Web Tokens (JWT)** | 9.0.3 | Authentication tokens |
| **bcrypt.js** | 3.0.3 | Password hashing |
| **CORS** | 2.8.6 | Cross-origin request security |
| **dotenv** | 17.2.3 | Environment variable management |

---

## 4. Backend — Billify API Server

**Directory:** `billify-backend/`

### Core Technologies

- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB via Mongoose v9.1.5
- **Authentication:** JWT (JSON Web Tokens)
- **Payments:** Razorpay v2.9.6

### Project Structure

```
billify-backend/
├── server.js                   # Entry point — Express app setup
├── seedAdmin.js                # Admin account seeder script
├── seedProducts.js             # Product data seeder script
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for environment config
│
└── src/
    ├── config/
    │   ├── db.js               # MongoDB connection (with in-memory fallback)
    │   ├── env.validation.js   # Startup environment validation
    │   └── storeLocations.js   # Store location constants
    │
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── auth.controller.js
    │   ├── bill.controller.js
    │   ├── payment.controller.js
    │   ├── product.controller.js
    │   └── support.controller.js
    │
    ├── middleware/
    │   └── auth.middleware.js   # JWT Bearer-token verification
    │
    ├── models/
    │   ├── Bill.js
    │   ├── Offer.js
    │   ├── Payment.js
    │   ├── Product.js
    │   ├── SupportTicket.js
    │   └── User.js
    │
    ├── routes/
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── bill.routes.js
    │   ├── payment.routes.js
    │   ├── product.routes.js
    │   └── support.routes.js
    │
    └── utils/
        └── distanceUtils.js    # Distance/location calculations
```

### Key Features

- **Environment Validation** — Checks all required variables (`MONGO_URI`, `JWT_SECRET`, Razorpay keys) at startup with clear error reporting.
- **In-Memory Fallback** — Automatically starts `mongodb-memory-server` when local MongoDB is unavailable during development.
- **Auto IP Detection** — Detects local network IP for LAN testing with Expo devices.
- **CORS Configuration** — Supports localhost, LAN IPs, ngrok tunnels, and Expo development URLs.
- **Request Logging** — Logs every incoming request method, URL, and client IP.
- **Seeder Scripts** — Pre-populate admin account and product catalog.

### NPM Scripts

| Command | Action |
|---------|--------|
| `npm start` | Start the server (`node server.js`) |
| `npm run dev` | Start with hot-reload (`nodemon server.js`) |
| `npm run seed:admin` | Create the default admin account |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens (≥32 chars) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key (starts with `rzp_test_` or `rzp_live_`) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API secret key |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `SERVER_IP` | No | Override auto-detected LAN IP |

---

## 5. Admin Portal — Billify Admin Dashboard

**Directory:** `billify-admin-main/`

### Core Technologies

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Charts:** Recharts 3.8.0
- **Animations:** Framer Motion 12.38.0, Rive 4.27.3
- **Icons:** Lucide React 0.577.0
- **Fonts:** Geist Sans, Geist Mono (Google Fonts)

### Project Structure

```
billify-admin-main/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme)
│   ├── LayoutClient.tsx        # Client layout (sidebar, navbar)
│   ├── page.tsx                # Landing / redirect page
│   ├── globals.css             # Global styles (Tailwind)
│   │
│   ├── login/                  # Admin login page
│   ├── admin/                  # Main admin dashboard
│   ├── products/               # Product listing & management
│   ├── add-product/            # Add new product form
│   ├── bills/                  # Bill management
│   ├── payments/               # Payment tracking
│   ├── transactions/           # Transaction history
│   ├── sales/                  # Sales analytics & charts
│   ├── customer-insights/      # Customer analytics
│   ├── offers/                 # Offer/coupon management
│   ├── discounts/              # Discount management
│   ├── users/                  # User management
│   ├── support/                # Support ticket management
│   ├── messages/               # Messaging / chat
│   │
│   ├── api/
│   │   └── proxy/[...path]/    # API proxy (forwards to backend)
│   │
│   └── components/
│       ├── Sidebar.tsx         # Navigation sidebar
│       ├── Navbar.tsx          # Top navigation bar
│       ├── Logo.tsx            # Brand logo component
│       ├── DashboardCard.tsx   # Dashboard metric card
│       ├── StatCard.tsx        # Statistics card
│       ├── QuickStats.tsx      # Quick statistics overview
│       ├── SalesChart.tsx      # Sales line/bar chart
│       ├── SalesTable.tsx      # Sales data table
│       ├── SalesBreakdownChart.tsx
│       ├── RecentSalesTable.tsx
│       ├── TopProductsChart.tsx
│       ├── CustomerGrowthChart.tsx
│       ├── CustomerSegmentationChart.tsx
│       ├── CustomerStatsCards.tsx
│       ├── TopCustomersTable.tsx
│       ├── ProductTable.tsx
│       ├── EnhancedProductTable.tsx
│       ├── ProductForm.tsx
│       ├── AddProductModal.tsx
│       ├── OffersTable.tsx
│       ├── OfferStatsCards.tsx
│       ├── CreateOfferModal.tsx
│       ├── LowStockAlert.tsx
│       ├── MessagesTable.tsx
│       ├── ChatList.tsx
│       ├── ChatView.tsx
│       ├── CatButton.tsx
│       ├── AdminSessionState.tsx
│       │
│       ├── admin/
│       │   ├── AdminThemeProvider.tsx   # Dark/light theme provider
│       │   ├── ThemeToggle.tsx          # Theme toggle button
│       │   └── navigation.ts           # Navigation config
│       │
│       └── dashboard/
│           ├── ChartCard.tsx
│           ├── StatCard.tsx
│           ├── StateViews.tsx
│           └── TransactionTable.tsx
│
└── lib/
    ├── adminApi.ts             # API client for backend communication
    ├── currency.ts             # Currency formatting utilities
    ├── mockData.ts             # Development mock data
    └── useAdminSession.ts      # Admin session management hook
```

### Admin Portal Pages (14 Pages)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Admin authentication |
| Dashboard | `/admin` | Overview with stats, charts, recent activity |
| Products | `/products` | Product listing with search & filters |
| Add Product | `/add-product` | Product creation form with barcode |
| Bills | `/bills` | View and manage all customer bills |
| Payments | `/payments` | Track payment statuses |
| Transactions | `/transactions` | Full transaction history |
| Sales | `/sales` | Sales analytics with charts |
| Customer Insights | `/customer-insights` | Customer analytics & segmentation |
| Offers | `/offers` | Create and manage promotional offers |
| Discounts | `/discounts` | Manage discount rules |
| Users | `/users` | User account management |
| Support | `/support` | Support ticket management |
| Messages | `/messages` | In-app messaging / chat |

### Key Features

- **Dark/Light Theme** — System-aware theme with manual toggle, persisted in localStorage.
- **Responsive Sidebar** — Collapsible navigation with route-based active states.
- **Real-Time Analytics** — Sales, customer growth, and product performance charts (Recharts).
- **API Proxy** — Next.js API route proxies requests to backend, avoiding CORS issues.
- **Session Management** — Custom `useAdminSession` hook for admin auth state.

### NPM Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Start dev server |
| `npm run serve` | Serve production build |
| `npm run lint` | Run ESLint |

---

## 6. Mobile Application — Billify App

**Directory:** Root `app/` folder + `App.tsx`, `index.ts`

### Core Technologies

- **Framework:** React Native 0.81.5
- **Build System:** Expo SDK 54.0.33
- **Language:** TypeScript 5.9.2
- **Navigation:** React Navigation 7.x (Native Stack)
- **State:** React Context API
- **Storage:** AsyncStorage 2.2.0
- **Icons:** Lucide React Native 0.563.0

### Project Structure

```
app/
├── config/
│   ├── apiConfig.ts            # API URL resolution (supports ngrok + LAN)
│   └── firebase.ts             # Firebase config (deprecated — auth via backend API)
│
├── navigation/
│   └── AppNavigator.tsx        # React Navigation stack setup
│
├── context/
│   ├── AuthContext.tsx          # Authentication state (login, logout, user data)
│   ├── CartContext.tsx          # Shopping cart state (add, remove, quantities)
│   ├── LocationContext.tsx      # Selected store / location state
│   └── ThemeContext.tsx         # Dark/light mode state
│
├── screens/                    # 25 screens (see table below)
│
├── components/
│   ├── IntroSplash.tsx         # Splash / intro animation (Rive)
│   ├── LocationHeader.tsx      # Current location header bar
│   ├── LocationSelector.tsx    # Store picker component
│   ├── RatingModal.tsx         # Star rating modal
│   ├── RefreshLocationButton.tsx
│   │
│   └── ui/                     # Reusable UI primitives
│       ├── AppButton.tsx
│       ├── AppCard.tsx
│       ├── AppHeader.tsx
│       ├── AppInput.tsx
│       ├── Screen.tsx
│       └── ThemeToggleButton.tsx
│
├── services/
│   ├── api.ts                  # HTTP client (Axios-based, with auth headers)
│   ├── firebaseAuth.ts         # Firebase auth service (deprecated)
│   ├── invoiceService.ts       # Bill/invoice API calls
│   ├── ratingService.ts        # Rating/review API calls
│   └── razorpayPayment.ts      # Razorpay integration with deep linking
│
├── constants/
│   ├── storeInventory.ts       # Store inventory master data
│   └── storeLocations.ts       # Store addresses & coordinates
│
├── theme/
│   └── index.ts                # Color palette, typography, spacing
│
├── types/                      # TypeScript type definitions
│
└── utils/
    └── locationUtils.ts        # Distance & geolocation helpers
```

### Mobile App Screens (25 Screens)

| # | Screen | Purpose |
|---|--------|---------|
| 1 | `LoginScreen` | Email/password login |
| 2 | `SignupScreen` | New user registration |
| 3 | `PhoneAuthScreen` | Phone number authentication |
| 4 | `OTPVerificationScreen` | OTP entry & verification |
| 5 | `LocationPermissionScreen` | Location permission request |
| 6 | `StoreSelectionScreen` | Choose nearby store |
| 7 | `DashboardScreen` | Main home screen with offers & quick actions |
| 8 | `ScanScreen` | Barcode scanner (camera) |
| 9 | `CartScreen` | Shopping cart with item management |
| 10 | `PaymentScreen` | Payment method selection |
| 11 | `PaymentMethodsScreen` | Saved payment methods |
| 12 | `RazorpayCheckoutScreen` | Razorpay payment WebView |
| 13 | `BillDetailsScreen` | Detailed bill view |
| 14 | `PreviousBillsScreen` | Bill history list |
| 15 | `ExitPassScreen` | Digital exit pass after payment |
| 16 | `OffersScreen` | Available offers & coupons |
| 17 | `CardsScreen` | Saved cards management |
| 18 | `UpiManagementScreen` | UPI payment management |
| 19 | `ProfileScreen` | User profile overview |
| 20 | `EditProfileScreen` | Edit profile details |
| 21 | `ChangePasswordScreen` | Password change |
| 22 | `NotificationSettingsScreen` | Notification preferences |
| 23 | `PrivacyPolicyScreen` | Privacy policy content |
| 24 | `HelpSupportScreen` | Help center & ticket submission |
| 25 | `TicketDetailsScreen` | View support ticket details |

### Key Features

- **Barcode Scanning** — Uses `expo-camera` for real-time product barcode scanning.
- **Location-Based Store Selection** — GPS-based nearest store detection via `expo-location`.
- **Smart API Resolution** — Automatically detects backend URL from Expo debug host, ngrok tunnel, or environment variable.
- **Digital Exit Pass** — Generated after successful payment for store exit verification.
- **Razorpay Checkout** — In-app payment via WebView with deep-link callback.
- **Dark/Light Theme** — Consistent theming across all screens.
- **Offline-Capable Auth** — Token-based auth persisted in AsyncStorage.
- **Invoice Generation** — Bill creation and PDF-ready print support via `expo-print`.

### Expo Configuration

| Setting | Value |
|---------|-------|
| App Name | billify-mobile |
| Slug | billify-mobile |
| URL Scheme | `billify://` |
| Orientation | Portrait |
| Android Permissions | Camera, Fine Location, Coarse Location |

### EAS Build Profiles

| Profile | Distribution | Build Type |
|---------|-------------|------------|
| `development` | Internal | APK (Android) / Simulator (iOS) |
| `preview` | Internal | Default |
| `production` | Store | Default |

---

## 7. Database Design

**Database:** MongoDB (hosted on MongoDB Atlas or local)
**ODM:** Mongoose 9.1.5
**Database Name:** `billify`

### Collections (6 Models)

#### Users

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Full name |
| `email` | String | Unique, used for login |
| `phone` | String | Phone number |
| `location` | String | User location |
| `password` | String | bcrypt-hashed |
| `emailVerified` | Boolean | Email verification status |
| `role` | String | `user` or `admin` |

#### Products

| Field | Type | Notes |
|-------|------|-------|
| `barcode` | String | Unique product barcode |
| `name` | String | Product name |
| `price` | Number | Price in INR |
| `category` | String | Product category |
| `stock` | Number | Available quantity |

#### Bills

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Reference to Users |
| `items` | Array | Product list (name, price, qty) |
| `subtotal` | Number | Pre-tax total |
| `tax` | Number | Tax amount |
| `totalAmount` | Number | Final amount |
| `paymentStatus` | String | `pending` or `paid` |

#### Payments

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Reference to Users |
| `orderId` | String | Razorpay order ID |
| `paymentId` | String | Razorpay payment ID |
| `signature` | String | Payment signature for verification |
| `amount` | Number | Payment amount |
| `status` | String | `pending`, `completed`, or `failed` |
| `method` | String | Payment method used |

#### Offers

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Offer title |
| `couponCode` | String | Unique, uppercase coupon code |
| `discountType` | String | `percentage`, `fixed`, or `bogo` |
| `discountValue` | Number | Discount amount/percentage |
| `applicableProducts` | String | Target products |
| `startDate` | Date | Offer start date |
| `endDate` | Date | Offer end date |
| `status` | String | Active/inactive |

#### Support Tickets

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Reference to Users |
| `title` | String | Ticket subject |
| `description` | String | Issue description |
| `category` | String | `billing-issue`, `payment-failure`, `refund-request`, `technical-problem`, `account-issue`, `other` |
| `status` | String | `open`, `in-progress`, or `closed` |
| `response` | String | Admin response |
| `respondedAt` | Date | Response timestamp |

---

## 8. API Endpoints

**Base URL:** `http://localhost:5000` (development)

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login (returns JWT) |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

### Products (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:barcode` | Get product by barcode |
| POST | `/api/products` | Add new product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Bills (`/api/bills`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bills` | Create a new bill |
| GET | `/api/bills` | Get user's bills |
| GET | `/api/bills/:id` | Get bill details |

### Payments (`/api/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |

### Support (`/api/support`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support` | Create support ticket |
| GET | `/api/support` | Get user's tickets |
| GET | `/api/support/:id` | Get ticket details |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/bills` | List all bills |
| GET | `/api/admin/stats` | Dashboard statistics |
| POST | `/api/admin/offers` | Create offer/coupon |
| GET | `/api/offers/active` | Get active offers (public) |

---

## 9. Authentication & Security

### Authentication Flow

```
1. User registers/logs in  →  Backend validates credentials
2. Backend generates JWT   →  Token sent to client
3. Client stores token     →  AsyncStorage (mobile) / localStorage (admin)
4. Subsequent requests     →  Token sent in Authorization: Bearer <token>
5. Backend middleware       →  Verifies JWT on protected routes
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | bcrypt.js with salt rounds |
| **JWT Authentication** | Signed tokens with expiration |
| **CORS Protection** | Whitelist-based origin validation |
| **Environment Variables** | Sensitive config in `.env` (not committed) |
| **Input Validation** | Server-side validation on all endpoints |
| **Startup Validation** | Required env vars checked before server starts |
| **HTTPS Tunneling** | ngrok for secure external access during development |

---

## 10. Payment Integration

### Razorpay Payment Flow

```
1. Mobile App        →  POST /api/payments/create-order (amount, currency)
2. Backend           →  Creates Razorpay order via Razorpay SDK
3. Backend           →  Returns orderId to mobile app
4. Mobile App        →  Opens Razorpay checkout (WebView)
5. User              →  Completes payment (UPI/Card/Netbanking)
6. Razorpay          →  Redirects to app via deep link (billify://)
7. Mobile App        →  POST /api/payments/verify (orderId, paymentId, signature)
8. Backend           →  Verifies signature with Razorpay secret
9. Backend           →  Updates bill status to "paid"
10. Mobile App       →  Shows exit pass / success screen
```

### Supported Payment Methods

- UPI (Google Pay, PhonePe, etc.)
- Credit / Debit Cards
- Net Banking
- Wallets

---

## 11. DevOps & Tooling

### Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **Git** | Version control |
| **npm** | Package management |
| **nodemon** | Backend hot-reload |
| **Expo CLI** | Mobile development & builds |
| **EAS CLI** | Expo Application Services (cloud builds) |
| **ngrok** | HTTPS tunneling for mobile ↔ backend |
| **MongoDB Compass** | Database GUI |
| **Postman** | API testing |

### Build & Deployment

| Module | Build Command | Output |
|--------|--------------|--------|
| Backend | `npm start` | Node.js server on port 5000 |
| Admin Portal | `npm run build` | Static Next.js build |
| Mobile App | `eas build --profile production` | APK / AAB for Android, IPA for iOS |

### Environment Setup

| Service | Configuration |
|---------|--------------|
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster |
| **Razorpay Dashboard** | API keys (test/live) |
| **Expo** | Project registered as `billify-mobile` |
| **ngrok** | HTTP tunnel for `localhost:5000` |

---

## 12. Folder Structure

```
Billify_demo/
│
├── App.tsx                     # Mobile app entry point
├── index.ts                    # Expo entry file
├── app.json                    # Expo configuration
├── eas.json                    # EAS build profiles
├── package.json                # Mobile app dependencies
├── tsconfig.json               # TypeScript configuration
├── metro.config.js             # Metro bundler config
│
├── app/                        # ── Mobile App Source ──
│   ├── config/                 #    API & Firebase config
│   ├── context/                #    React Context providers
│   ├── screens/                #    25 app screens
│   ├── components/             #    Shared & UI components
│   ├── services/               #    API service layer
│   ├── navigation/             #    React Navigation setup
│   ├── constants/              #    Static data
│   ├── theme/                  #    Theme definitions
│   ├── types/                  #    TypeScript types
│   └── utils/                  #    Utilities
│
├── billify-backend/            # ── Backend API ──
│   ├── server.js               #    Express server entry
│   ├── package.json            #    Backend dependencies
│   ├── seedAdmin.js            #    Admin seeder
│   ├── seedProducts.js         #    Product seeder
│   └── src/
│       ├── config/             #    DB, env validation
│       ├── controllers/        #    Route handlers
│       ├── middleware/          #    Auth middleware
│       ├── models/             #    Mongoose schemas
│       ├── routes/             #    Express routes
│       └── utils/              #    Utilities
│
├── billify-admin-main/         # ── Admin Portal ──
│   ├── app/                    #    Next.js App Router pages
│   │   ├── components/         #    React components
│   │   └── api/                #    API proxy routes
│   ├── lib/                    #    Utilities & API client
│   └── public/                 #    Static assets
│
├── android/                    # Android native project (Expo prebuild)
└── assets/                     # Images, icons, splash screens
```

---

> **Billify** — Making retail checkout faster, simpler, and smarter.
