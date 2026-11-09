# CritaSpace Backend

The CritaSpace backend provides REST APIs for managing a shared-workspace boardroom booking system.

## Technology Stack

- Node.js
- Express.js 5
- TypeScript
- Firebase Authentication
- Firebase Admin SDK
- Cloud Firestore

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── audit-logs/
│   │   ├── auth/
│   │   ├── boardrooms/
│   │   ├── bookings/
│   │   ├── companies/
│   │   ├── dashboard/
│   │   └── users/
│   ├── routes/
│   ├── scripts/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js and npm
- Google Cloud CLI
- Access to the CritaSpace Firebase project

## Installation

From the backend directory:

```bash
npm install
```

## Environment Configuration

Create a local `.env` file using `.env.example` as the template.

```env
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=critaspace-v2
CORS_ORIGIN=http://localhost:5173
```

Never commit `.env` files or Firebase credentials to Git.

## Firebase Authentication

The backend uses Firebase Admin SDK with Application Default Credentials (ADC).

It does not require service-account JSON key files.

Configure the Google Cloud CLI:

```bash
gcloud config set project critaspace-v2
gcloud auth application-default login
```

Ensure the authenticated Google account has the required Firebase and Firestore permissions.

## Development Commands

Start the development server:

```bash
npm run dev
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Build the backend:

```bash
npm run build
```

Start the compiled backend:

```bash
npm start
```

## Available Modules

| Module | Responsibility |
|---|---|
| Auth | Authentication-related API operations |
| Users | User management and company assignment |
| Companies | Company management |
| Boardrooms | Boardroom configuration and maintenance |
| Bookings | Booking creation, availability, rules and recurring bookings |
| Audit Logs | Administrative audit records and booking history |
| Dashboard | Workspace and dashboard summaries |

## Security

- Firebase ID token verification
- Role-based access control
- Global Admin and regular user roles
- Server-side authorization
- Firestore access through the backend
- No service-account JSON keys

## Development Approach

The backend is developed locally before frontend integration.

Testing and deployment are handled separately after the development phase.