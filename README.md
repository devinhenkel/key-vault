# API Key Catalog

A lightweight full-stack app for maintaining a private catalog of API keys by platform. Built with Node.js, Express, React, Tailwind CSS, PostgreSQL, Prisma, and Docker.

## Features

- **CRUD operations**: Create, view, edit, and delete API key records
- **Secure key handling**: API keys are encrypted at rest, masked in the UI by default
- **Reveal & Copy**: Explicit actions to view or copy a key value
- **Search & filter**: Search by platform name, label, description, or creator; filter by active/inactive
- **Status indicators**: Visual badges for expired keys, keys expiring soon (≤30 days), and inactive keys
- **Confirmation dialogs**: Delete confirmation to prevent accidental data loss
- **Empty & error states**: Clean UX for first-run and error scenarios

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Frontend | React, Vite, Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Containerization | Docker, Docker Compose |
| Encryption | AES-256-GCM (Node.js crypto) |

## Quick Start (Docker)

```bash
# 1. Clone and enter the project
cd api-key-catalog

# 2. Copy the env example and set your encryption secret
cp .env.example .env
# Edit .env — at minimum, set ENCRYPTION_SECRET to a real secret:
#   openssl rand -base64 32

# 3. Build and run
docker compose up --build
```

The app will be available at **http://localhost:3001**.

The first startup will automatically:
- Start PostgreSQL
- Run Prisma migrations
- Start the Express server (serving both API and built frontend)

### Seed Sample Data (Optional)

```bash
docker compose exec app npm run seed
```

This inserts 4 sample API key records with obviously dummy key values.

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ running locally

### Setup

```bash
# 1. Install server dependencies
cd server
npm install
npx prisma generate

# 2. Install client dependencies
cd ../client
npm install

# 3. Set up environment variables
cd ..
cp .env.example .env
# Edit .env with your local PostgreSQL connection string and encryption secret

# 4. Run database migrations
cd server
npx prisma migrate deploy
# Or for development: npx prisma migrate dev

# 5. (Optional) Seed sample data
npm run seed

# 6. Start the backend (terminal 1)
npm run dev    # runs on http://localhost:3001

# 7. Start the frontend (terminal 2)
cd ../client
npm run dev    # runs on http://localhost:5173 (proxies /api to backend)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — (required) |
| `ENCRYPTION_SECRET` | Secret used for AES-256-GCM encryption of key values | — (required in production) |
| `POSTGRES_DB` | PostgreSQL database name (Docker) | `keycatalog` |
| `POSTGRES_USER` | PostgreSQL username (Docker) | `keycatalog` |
| `POSTGRES_PASSWORD` | PostgreSQL password (Docker) | `keycatalog_dev` |
| `VITE_API_URL` | Backend URL for Vite dev proxy | `http://localhost:3001` |

## Database Migrations

Migrations are stored in `server/prisma/migrations/` and run automatically on `docker compose up`.

### Creating a new migration

```bash
cd server
npx prisma migrate dev --name descriptive_name
```

### Deploying migrations (production)

```bash
cd server
npx prisma migrate deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/keys` | List all keys (masked). Supports `?search=` and `?active=true/false` |
| `GET` | `/api/keys/:id` | Get a single key (masked) |
| `POST` | `/api/keys` | Create a new key record |
| `PUT` | `/api/keys/:id` | Update an existing key record |
| `DELETE` | `/api/keys/:id` | Delete a key record |
| `POST` | `/api/keys/:id/reveal` | Reveal the plaintext key value |

## Security Notes

- **Encryption at rest**: Key values are encrypted with AES-256-GCM using a secret from `ENCRYPTION_SECRET`. Only the `/reveal` endpoint returns plaintext.
- **Masked by default**: List and detail views show masked keys (e.g., `sk-a••••wxyz`).
- **No key logging**: Error handlers never log key values.
- **Secrets out of source control**: `.env` is gitignored. Only `.env.example` is committed.
- **Key value field**: The form uses `type="password"` for the key input. On edit, the key field is left blank by default to preserve the existing encrypted value.

## Project Structure

```
api-key-catalog/
├── Dockerfile                    # Multi-stage build: client + server
├── docker-compose.yml            # App + PostgreSQL with persistent volume
├── .env.example                  # Environment variable template
├── .gitignore
├── .dockerignore
├── README.md
├── server/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/
│   │       └── 20260703000000_init/
│   │           └── migration.sql
│   ├── scripts/
│   │   └── seed.js                # Sample data with dummy keys
│   └── src/
│       ├── index.js               # Express app entry point
│       ├── routes/
│       │   └── keys.js            # CRUD + reveal endpoints
│       ├── middleware/
│       │   └── validation.js      # Request validation
│       └── utils/
│           ├── crypto.js          # AES-256-GCM encrypt/decrypt/mask
│           └── prisma.js          # Prisma client singleton
└── client/
    ├── package.json
    ├── vite.config.js             # Vite config with API proxy
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Main app with state management
        ├── index.css              # Tailwind directives
        ├── components/
        │   ├── KeyTable.jsx        # Searchable table with status badges
        │   ├── KeyForm.jsx         # Create/edit form modal
        │   ├── KeyDetailModal.jsx  # Detail view with reveal/copy
        │   └── ConfirmDialog.jsx   # Delete confirmation
        └── utils/
            ├── api.js              # API client
            └── helpers.js          # Status logic, date formatting
```

## License

MIT — Use this for your own private key management needs.