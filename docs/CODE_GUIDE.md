# AgroTech Solution Code Guide

This guide explains what each major file/folder is for and why it exists.

## Root Files

- `index.html`
  - Entry HTML for the React app.
  - Sets the favicon and mounts the app at `#root`.

- `package.json`
  - Frontend scripts (`dev`, `build`) and full app scripts (`start`, `dev:all`).

- `vite.config.ts`
  - Vite bundler config.
  - Includes frontend dev proxy from `/api` to backend (`localhost:4000`).

- `render.yaml`
  - Render deployment blueprint.
  - Defines build/start commands and required environment variables.

## Branding Assets

- `public/images/logomain.png`
  - Main brand logo used in app UI and as favicon.

- `public/images/README.md`
  - Notes for replacing logo/favicon assets safely.

## Frontend App Structure

- `src/main.tsx`
  - React entrypoint. Initializes router and global providers.

- `src/app/App.tsx`
  - Main app shell.

- `src/app/routes.tsx`
  - Route map for pages such as Home, Login, Register, Dashboard, Admin.

### Frontend Components

- `src/app/components/Home.tsx`
  - Landing page for marketing and navigation.
  - Header logo links back to homepage.

- `src/app/components/Login.tsx`
  - Auth page for sign in and password reset request.
  - Logo links back to homepage.

- `src/app/components/Register.tsx`
  - Auth page for sign up and farmer subscription flow.
  - Logo links back to homepage.

- `src/app/components/FarmerDashboard.tsx`
  - Farmer workspace for crops, weather, alerts, learning/training, account updates.

- `src/app/components/BuyerDashboard.tsx`
  - Buyer workspace for product browsing, cart, and checkout flow.

- `src/app/components/AdminDashboard.tsx`
  - Admin overview metrics and management tooling.

- `src/app/components/AiAssistant.tsx`
  - TechGro assistant interface for disease detection and farming guidance.

### Frontend State and API

- `src/app/context/AuthContext.tsx`
  - Global auth state management.
  - Handles login/register/logout/session refresh behavior.

- `src/app/lib/api.ts`
  - Centralized frontend API client.
  - Defines request helper, typed models, and route-specific API calls.

## Backend Structure

- `backend/src/server.js`
  - Express server entrypoint.
  - Registers API routes, CORS policy, static frontend serving, and fallback routing.

- `backend/src/utils/origins.js`
  - CORS origin allowlist utility.
  - Supports local development origins and configured production origins.

### Backend Route Files

- `backend/src/routes/auth.js`
  - User registration/login and token generation.

- `backend/src/routes/users.js`
  - Profile update, password change/reset, role switch, and subscription update.

- `backend/src/routes/crops.js`
  - Farmer crop CRUD and status tracking.

- `backend/src/routes/weather.js`
  - Weather data and alert generation logic.

- `backend/src/routes/ai.js`
  - TechGro AI endpoint and fallback response behavior.

- `backend/src/routes/products.js`
  - Product listing/filter endpoints.

- `backend/src/routes/orders.js`
  - Order creation and order history endpoints.

- `backend/src/routes/payments.js`
  - Payment intent handling (Stripe or simulated flow).

- `backend/src/routes/reviews.js`
  - Product/order review creation and retrieval.

- `backend/src/routes/admin.js`
  - Admin dashboard summary endpoints.

- `backend/src/routes/trainings.js`
  - Farmer training/session management endpoints.

## Data Files

- `backend/data/users.json`
  - User accounts with role/profile/subscription information.

- `backend/data/crops.json`
  - Farmer crop records and lifecycle status.

- `backend/data/orders.json`
  - Buyer orders and fulfillment/payment snapshots.

- `backend/data/reviews.json`
  - Product reviews.

- `backend/data/passwordResets.json`
  - Password reset request tokens and statuses.

- `backend/data/trainings.json`
  - Training bookings and progress records.

## Why This Guide Exists

Adding line comments to every file and every line creates noise and makes code harder to maintain. This document provides a clear map of what each area does and why it exists, while keeping source files readable.
