const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const pool = new Pool({
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