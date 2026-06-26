# StoreRating - Multi-Role Store Rating Portal

### Live Deployment (Placeholder)
**[Launch StoreRating Application](https://store-rating-portal.example.com)**

---

## Project Overview
StoreRating is a full-stack web application designed for rating local stores. It supports a single portal login system that auto-routes users to their appropriate dashboard based on one of three roles:
1. **System Administrator**: Manages stores, users, directory filtering, sorting, and stats.
2. **Store Owner**: Views store reviews list and the overall rating average gauge.
3. **Normal User**: Registers, changes passwords, browses and searches stores, and submits/modifies ratings.

---

## Tech Stack
*   **Frontend**: ReactJS (Vite, Context API for authentication/toasts, Custom CSS Variables & Glassmorphic UI layout)
*   **Backend**: NodeJS + ExpressJS
*   **Database**: MySQL + Sequelize ORM

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   MySQL Server running locally

---

### 1. Database & Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Configure your local environment variables in `backend/.env`:
   ```ini
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=vansh123
   DB_NAME=store_rating_db
   JWT_SECRET=super_secret_store_rating_key_12345
   ```
4. Seed the database (creates database, tables, and inserts demo profiles):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm start
   ```

---

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## Test Credentials (Pre-Seeded)

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@12345!` |
| **Store Owner** | `owner1@storerating.com` | `Owner@12345!` |
| **Normal User** | `user@storerating.com` | `User@12345!` |

---

## Form Validations
*   **Name**: Min 20 characters, Max 60 characters.
*   **Address**: Max 400 characters.
*   **Password**: 8-16 characters, containing at least one uppercase letter and one special symbol.
*   **Email**: RFC-compliant validation check.
