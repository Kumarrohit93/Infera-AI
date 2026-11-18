const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./Config/db");
const { initDb } = require("./Config/initDb");
const documentRoutes = require("./Routes/document.routes");
const folderRoutes = require("./Routes/folder.routes");
const ragRoutes = require("./Routes/rag.routes");
const conversationRoutes = require("./Routes/conversation.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = new Set(
    [
        "http://localhost:5001",
        "http://localhost:5173",
        process.env.CORS_ORIGIN,
        process.env.CORS_ORIGINS,
    ]
        .filter(Boolean)
        .flatMap((origins) => origins.split(","))
        .map((origin) => origin.trim())
        .filter(Boolean)
);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
    })
);
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
app.use("/api/folders", folderRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/conversations", conversationRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 7000;
app.listen(port, async () => {
    console.log(`RAG Backend running on port ${port}`);
    await initDb();
});
