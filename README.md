# Finance Tracker

The project files now live in the `FinanceTracker` directory. Run all commands from that folder.

## Prerequisites

- **Node.js** v20 or later
- npm (bundled with Node)

## Install Dependencies

Navigate to the project directory and install packages:

```bash
cd FinanceTracker
npm install
```

## Development

Start the development server with:

```bash
npm run dev
```

This runs the Express API and Vite client together on port **5000**.

## Build and Start in Production

Build the client and server bundles:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## Additional Commands

- `npm run check` – run TypeScript type checks.
- `npm run db:push` – push database migrations with Drizzle.

## Database Setup

Create a `.env` file inside `FinanceTracker` with a `DATABASE_URL` pointing to your PostgreSQL instance, for example:

```
DATABASE_URL=postgresql://postgres:test@localhost:5432/mydb
```

Run `npm run db:push` to apply the schema migrations to the database before starting the server.

