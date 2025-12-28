# SayonEdge

This is a full-stack medical appointment management system. It consists of a Node.js/Express backend (`service`) and a React/Vite frontend (`ui`).

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (running locally or via Docker)
- npm or yarn

## Project Structure

- `service/`: Backend API (Express, Prisma, PostgreSQL)
- `ui/`: Frontend Application (React, Vite, TailwindCSS)

---

## 1. Database Setup

Ensure you have a PostgreSQL database running. You can create a new database called `sayonedge` (or any name you prefer).

```bash
# Example if using psql CLI
CREATE DATABASE sayonedge;
```

## 2. Backend Setup (`service`)

Navigate to the service directory:

```bash
cd service
```

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the `service` directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sayonedge?schema=public"
JWT_SECRET="your_super_secret_key"
PORT=3000
```
*Replace `user`, `password`, and `db_name` with your actual Postgres credentials.*

### Database Migration & Prisma Setup

Push the schema to your database to create the necessary tables:

```bash
npx prisma db push
```

Generate the Prisma Client types:

```bash
npx prisma generate
```

### Run the Backend

Start the development server:

```bash
npm run dev
```

The API should now be running on `http://localhost:3000`.

---

## 3. Frontend Setup (`ui`)

Open a new terminal and navigate to the UI directory:

```bash
cd ui
```

### Install Dependencies

```bash
npm install
```

### Run the Frontend

Start the Vite development server:

```bash
npm run dev
```

The frontend should now be running (usually on `http://localhost:5173`).

---

## Summary of Commands

**Backend:**
```bash
cd service
npm install
npx prisma db push
npx prisma generate
npm run dev
```

**Frontend:**
```bash
cd ui
npm install
npm run dev
```

## Notes

- The backend logs requests using `morgan`.
- Authentication uses JWT.
- Ensure the backend is running before trying to log in on the frontend.
