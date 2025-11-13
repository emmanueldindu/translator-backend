# Wendu Backend

Backend API for Wendu translation app with authentication and request limiting.

## Features

- **User Authentication**: Register, login, logout with JWT
- **Request Limiting**: 3 free translations for guests, unlimited for logged-in users
- **PostgreSQL Database**: Using Prisma ORM
- **Translation History**: Track all translations

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

Make sure you have PostgreSQL installed and running. Create a database:

```bash
createdb wendu_db
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://username:password@localhost:5432/wendu_db?schema=public"
```

Generate a strong JWT secret:

```
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

### 4. Run Prisma Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Translation

- `GET /api/translation/remaining` - Check remaining translations
- `POST /api/translation/record` - Record a translation
- `GET /api/translation/history` - Get translation history (requires auth)

## Database Schema

### User
- `id`: UUID
- `email`: String (unique)
- `name`: String (optional)
- `password`: String (hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Translation
- `id`: UUID
- `userId`: String (optional, null for guests)
- `text`: String
- `sourceLang`: String
- `targetLang`: String
- `result`: String
- `ipAddress`: String (for guest rate limiting)
- `createdAt`: DateTime

## Rate Limiting

- **Guest Users**: 3 translations per 24 hours (IP-based)
- **Logged-in Users**: Unlimited translations

## Development

View database with Prisma Studio:

```bash
npm run prisma:studio
```
