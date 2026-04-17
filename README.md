# DevPath

DevPath is a Mimo-style interactive coding platform built with Next.js, Tailwind CSS, NextAuth, Stripe, Vercel Blob, Groq, and Monaco Editor.

It ships with:

- learning paths for HTML, CSS, JavaScript, and Python
- short lessons with a coding challenge at the end
- an in-browser code editor with instant preview or Python output
- a lesson-aware AI tutor powered by Groq `llama-3.3-70b-versatile`
- progress tracking, XP, and daily streaks
- free vs Pro plan gating with Stripe subscriptions

## Stack

- Next.js 16 App Router
- Tailwind CSS 4
- NextAuth credentials auth
- Stripe Checkout + Billing Portal
- Vercel Blob for persistence
- Groq SDK for the tutor
- Monaco Editor for the coding workspace

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
copy .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` with:

```bash
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

GROQ_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

BLOB_READ_WRITE_TOKEN=
```

Notes:

- In local development, DevPath falls back to `.data/devpath` if `BLOB_READ_WRITE_TOKEN` is missing.
- In production, Blob storage should be configured.
- `NEXT_PUBLIC_APP_URL` should match your deployed domain in Vercel.

## Auth

DevPath uses NextAuth with a credentials provider.

- sign up: `POST /api/auth/register`
- sign in: NextAuth credentials flow on `/sign-in`

User accounts are stored in Vercel Blob or the local fallback store.

## Billing

Stripe powers the Pro subscription.

- `POST /api/billing/checkout` creates a Stripe Checkout subscription session
- `POST /api/billing/portal` opens the customer billing portal
- `GET /api/billing/verify` verifies a completed checkout session
- `POST /api/stripe/webhook` syncs subscription state

Pro unlocks:

- Python path
- future paid paths
- unlimited AI tutor messages

## AI tutor

The AI tutor lives at `POST /api/tutor`.

It uses:

- Groq SDK
- model: `llama-3.3-70b-versatile`
- lesson context from the current learning path

Free users get a limited daily tutor allowance. Pro gets unlimited access.

## Progress and persistence

Progress is stored per user and includes:

- completed lessons
- XP total
- streak days

Persistence currently uses:

- Vercel Blob in configured environments
- local `.data/devpath` files in development

## Important routes

- `/` home and pricing
- `/sign-in`
- `/sign-up`
- `/learn/[pathSlug]`
- `/learn/[pathSlug]/[lessonSlug]`
- `/billing/success`

## Validation

Run these before shipping:

```bash
npm run lint
npm run build
```

## Stripe webhook setup

In Stripe, point your webhook to:

```bash
https://your-domain.com/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Deploy to Vercel

1. Create a Vercel project for this folder.
2. Add all required environment variables.
3. Deploy.
4. Add the Stripe webhook endpoint for the production domain.

For production auth, update:

- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

## Current product shape

- Free tier: HTML, CSS, JavaScript
- Pro: Python + unlimited tutor + future premium content
- Account system: email/password
- Design: dark, modern, mobile responsive
