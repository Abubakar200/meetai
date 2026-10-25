# Meet.AI

Meet.AI is a web application built with Next.js. Authentication is handled by
[Better Auth](https://www.better-auth.com/) with Drizzle ORM and PostgreSQL.

## Requirements

- Node.js 20 or newer
- npm
- A PostgreSQL database
- Google and GitHub OAuth application credentials for social sign-in

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```dotenv
   DATABASE_URL="postgresql://..."
   BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"

   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

   Keep this file private; environment files are excluded from Git.

3. Configure the OAuth applications to use these callback URLs:

   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`

   For deployment, replace `localhost:3000` with the application’s public
   origin and update `BETTER_AUTH_URL` accordingly.

4. Create or update the authentication tables in the configured database:

   ```bash
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Authentication

- Sign in: `/auth/sign-in`
- Sign up: `/auth/sign-up`
- Better Auth API: `/api/auth`

The app supports email/password registration and sign-in, plus Google and
GitHub social sign-in. The authentication tables are defined in
`app/db/schema.ts`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Drizzle schema to PostgreSQL |
| `npm run db:studio` | Open Drizzle Studio |
