const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { QUEUE_NAME } = require("./ingestionQueue");
const { downloadBuffer } = require("./storage.service");
const {
  ingestUploadedDocument,
  markDocumentVersionFailed,
} = require("./document.service");

let connection;
let worker;

async function startIngestionWorker() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required to run the document worker");
  }
  if (worker) return worker;

  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(`[Ingestion] Job ${job.id} started.`);
      const buffer = await downloadBuffer(job.data.storageKey, job.data.ext);
      await ingestUploadedDocument({ ...job.data, buffer });
    },
    {
      connection,
      concurrency: Number(
        process.env.INGESTION_CONCURRENCY ||
          (process.env.RUN_INGESTION_WORKER === "true" ? 1 : 2)
      ),
    }
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

  await worker.waitUntilReady();
  console.log("[Ingestion] Worker started.");
  return worker;
}

async function closeIngestionWorker() {
  const activeWorker = worker;
  const activeConnection = connection;
  worker = undefined;
  connection = undefined;

  if (activeWorker) await activeWorker.close();
  if (activeConnection && activeConnection.status !== "end") {
    await activeConnection.quit();
  }
}

module.exports = { startIngestionWorker, closeIngestionWorker };
