# Finance Tracker

This project lives inside a nested directory: `FinanceTracker/FinanceTracker`. All commands should be run from that folder.

## Prerequisites

- **Node.js** v20 or later
- npm (bundled with Node)

## Install Dependencies

Navigate to the nested directory and install packages:

```bash
cd FinanceTracker/FinanceTracker
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

