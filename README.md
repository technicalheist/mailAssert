# mailAssert

A self-hosted email routing and temporary inbox service built with Next.js. Create disposable email addresses, receive emails, and manage them through a clean web interface.

## Features

- **Disposable Inboxes**: Create temporary email addresses on demand
- **Email Routing**: Dynamic email routing via Cloudflare Email Routing API
- **API Access**: RESTful API for programmatic inbox management
- **Authentication**: User accounts with email verification and password reset
- **Dashboard**: Web UI for managing inboxes and viewing emails
- **API Keys**: Generate API keys for third-party integrations

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Email**: Cloudflare Email Routing, Nodemailer, IMAP

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudflare account with a configured email domain
- SMTP/IMAP server access

## Setup

1. Clone the repository and install dependencies:

```bash
cd web
npm install
```

2. Copy the environment file and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mailassert
NEXTAUTH_SECRET=your-secret-key
MAIL_DOMAIN=your-domain.com
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
MAIL_SERVER=your-smtp-server
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-app-password
IMAP_SERVER=your-imap-server
IMAP_USERNAME=your-email
IMAP_PASSWORD=your-app-password
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

## Docker Deployment

```bash
docker compose up -d
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register a new user |
| `/api/v1/auth/login` | POST | Login |
| `/api/v1/auth/verify-email` | POST | Verify email |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/auth/reset-password` | POST | Reset password |
| `/api/v1/send` | POST | Send an email |
| `/api/inboxes` | GET | List all inboxes |
| `/api/inboxes/ids` | GET | List inbox IDs |
| `/api/emails` | GET | List all emails |
| `/api/emails/search` | POST | Search emails |

## License

MIT
