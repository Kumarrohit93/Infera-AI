require("./Config/env");

const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const pool = require("./Config/db");
const { initDb } = require("./Config/initDb");
const { QUEUE_NAME } = require("./Services/ingestionQueue");
const { downloadBuffer } = require("./Services/storage.service");
const {
  ingestUploadedDocument,
  markDocumentVersionFailed,
} = require("./Services/document.service");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required to run the document worker");
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
let worker;

async function startWorker() {
  await initDb();
  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const buffer = await downloadBuffer(job.data.storageKey, job.data.ext);
      await ingestUploadedDocument({ ...job.data, buffer });
    },
    { connection, concurrency: Number(process.env.INGESTION_CONCURRENCY || 2) }
  );

  worker.on("completed", (job) => {
    console.log(`[Ingestion] Job ${job.id} completed.`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[Ingestion] Job ${job?.id} failed:`, error.message);
    if (!job || job.attemptsMade < Number(job.opts.attempts || 1)) return;

    markDocumentVersionFailed({
      ...job.data,
      error: error.message,
    }).catch((dbError) =>
      console.error(`[Ingestion] Could not persist failure for ${job.id}:`, dbError.message)
    );
  });

  worker.on("error", (error) => {
    console.error("[Ingestion] Worker error:", error.message);
  });

  console.log("[Ingestion] Worker started.");
}

async function shutdown() {
  if (worker) await worker.close();
  await connection.quit();
  await pool.end();
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

startWorker().catch(async (error) => {
  console.error("[Ingestion] Worker initialization failed:", error.message);
  await connection.quit();
  await pool.end();
  process.exitCode = 1;
});
