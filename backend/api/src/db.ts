import { Pool } from "pg";

export const pgPool = new Pool({
    user: process.env.PGUSER || "your_user",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "my_database",
    password: process.env.PGPASSWORD || "your_password",
    port: Number(process.env.PGPORT || 5432),
});
