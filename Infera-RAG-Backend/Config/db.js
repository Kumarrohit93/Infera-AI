const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const databaseUrl = process.env.DATABASE_URL;
const hasSplitConfig = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"]
    .every((key) => process.env[key]);

if (!databaseUrl && !hasSplitConfig) {
    throw new Error(
        "Set DATABASE_URL or all of DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME"
    );
}

const pool = new Pool(databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

pool.on("connect", () => {
    console.log("PostgreSQL client connected");
});

pool.on("error", (err) => {
    console.error("Unexpected DB error:", err.message);
});

module.exports = pool;