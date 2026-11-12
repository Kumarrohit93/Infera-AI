const express = require("express");
require("dotenv").config();

const pool = require("./Config/db");
const documentRoutes = require("./routes/document.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database(), NOW()"
        );

        res.json({
            success: true,
            database: result.rows[0].current_database,
            time: result.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.use("/api/documents", documentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 5001, () => {
    console.log("RAG Backend running");
});