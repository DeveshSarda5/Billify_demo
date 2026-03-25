## Billify Admin

This admin panel is a standalone Next.js frontend that connects to the same shared backend as the Expo mobile app.

### Environment

Create a `.env.local` file in `billify-admin-main` and set either of these values if your backend is not running on the same host at port `5000`:

```bash
REACT_APP_API_BASE_URL=http://<your-ip>:5000/api
# or
NEXT_PUBLIC_API_BASE_URL=http://<your-ip>:5000/api
```

`REACT_APP_API_BASE_URL` is mapped into `NEXT_PUBLIC_API_BASE_URL` through `next.config.ts`, so the admin app can stay aligned with the mobile config requirement.

If neither env var is set, the admin app now uses a same-origin Next.js proxy in the browser and forwards requests to `http://127.0.0.1:5000/api` by default on the server.

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
