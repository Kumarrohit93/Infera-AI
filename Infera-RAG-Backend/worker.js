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
let startupPromise;
let shutdownPromise;
let shutdownRequested = false;

async function startWorker() {
  await initDb();
  if (shutdownRequested) return;

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
  shutdownRequested = true;
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = (async () => {
    if (startupPromise) await startupPromise.catch(() => {});
    if (worker) await worker.close();
    await connection.quit();
    await pool.end();
  })();

  return shutdownPromise;
}

function handleShutdownSignal() {
  shutdown().catch((error) => {
    console.error("[Ingestion] Worker cleanup failed:", error.message);
    process.exitCode = 1;
  });
}

process.once("SIGTERM", handleShutdownSignal);
process.once("SIGINT", handleShutdownSignal);

startupPromise = startWorker();
startupPromise.catch(async (error) => {
  console.error("[Ingestion] Worker initialization failed:", error.message);
  process.exitCode = 1;
  try {
    await shutdown();
  } catch (shutdownError) {
    console.error("[Ingestion] Worker cleanup failed:", shutdownError.message);
  }
});
