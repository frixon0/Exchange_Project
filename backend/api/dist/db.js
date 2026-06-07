"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgPool = void 0;
const pg_1 = require("pg");
exports.pgPool = new pg_1.Pool({
    user: process.env.PGUSER || "your_user",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "my_database",
    password: process.env.PGPASSWORD || "your_password",
    port: Number(process.env.PGPORT || 5432),
});
//# sourceMappingURL=db.js.map