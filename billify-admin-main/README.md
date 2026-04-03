## Billify Admin

This admin panel is a standalone Next.js frontend that connects to the same shared backend as the Expo mobile app.

### Environment

Create a `.env.local` file in `billify-admin-main` and set your deployed backend URL:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com/api
```

The admin app reads `process.env.NEXT_PUBLIC_API_BASE_URL` on both the client and server.

### Run

```bash
cd billify-admin-main
npm install
npm run dev
```

Open `http://localhost:3000`.

### Backend Requirements

The backend must already be running from `billify-backend` and reachable on the same base URL.

### Admin Login

The admin app uses the shared `/api/auth/login` endpoint and the same JWT format as the mobile app.

To create or upgrade an admin user on the backend:

```bash
cd billify-backend
npm run seed:admin
```

This script reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, and `ADMIN_PHONE` from `billify-backend/.env`.
