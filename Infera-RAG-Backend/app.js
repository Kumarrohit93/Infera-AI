const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./Config/db");
const { initDb } = require("./Config/initDb");
const { waitForIngestionQueue, closeIngestionQueue } = require("./Services/ingestionQueue");
const documentRoutes = require("./routes/document.routes");
const folderRoutes = require("./routes/folder.routes");
const ragRoutes = require("./routes/rag.routes");
const conversationRoutes = require("./routes/conversation.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
let server;
app.set("trust proxy", 1);
app.use(helmet());

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
app.use("/api/rag/ask", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
}));
app.use("/api/documents/upload", rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
}));
app.use("/api/documents/:id/versions", rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
}));

app.get("/health/live", (req, res) => {
    res.json({ success: true });
});

app.get("/health/ready", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database(), NOW()"
        );
        await waitForIngestionQueue();

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
app.use("/api/feedback", feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
    await initDb();
    await waitForIngestionQueue();

    const port = process.env.PORT || 7000;
    server = app.listen(port, () => {
        console.log(`RAG Backend running on port ${port}`);
    });
}

startServer().catch(async (error) => {
    console.error("[Startup] RAG backend initialization failed:", error.message);
    await pool.end();
    process.exitCode = 1;
});

async function shutdown() {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
    await closeIngestionQueue();
    await pool.end();
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
