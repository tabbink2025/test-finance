# FinanceTracker

This project stores data in a PostgreSQL database. The schema is defined using [drizzle-orm](https://orm.drizzle.team/).

## Database setup

1. Create a PostgreSQL database and note the connection string.
2. Set the `DATABASE_URL` environment variable to that connection string.
3. Install dependencies and push the schema:

   ```bash
   npm install
   npm run db:push
   ```

Running `npm run dev` starts the API server which connects to the database using the provided `DATABASE_URL`.
