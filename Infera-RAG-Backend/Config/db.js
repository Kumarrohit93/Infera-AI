const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
});

const connectDB = async () => {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("PostgreSQL Connected Successfully!");
        console.log("Database Time:", result.rows[0].now);

    } catch (error) {
        console.error("PostgreSQL Connection Failed:", error.message);
        process.exit(1);
    }
};

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL Error:", error.message);
});

module.exports = { pool, connectDB };
