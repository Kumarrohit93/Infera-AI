const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const QUEUE_NAME = "document-ingestion";
let queue;
let connection;

function getQueue() {
  if (!process.env.REDIS_URL) return null;
  if (queue) return queue;

  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  queue = new Queue(QUEUE_NAME, { connection });
  return queue;
}

async function enqueueDocumentIngestion(data) {
  const activeQueue = getQueue();
  if (!activeQueue) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL is required for production document processing");
    }
    return false;
  }

  await activeQueue.add("index-document", data, {
    jobId: data.versionId ? `${data.documentId}-${data.versionId}` : data.documentId,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
  return true;
}

async function waitForIngestionQueue() {
  const activeQueue = getQueue();
  if (!activeQueue) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL is required for production document processing");
    }
    return;
  }
  await activeQueue.waitUntilReady();
}

async function closeIngestionQueue() {
  if (queue) await queue.close();
  if (connection) await connection.quit();
  queue = undefined;
  connection = undefined;
}

module.exports = {
  QUEUE_NAME,
  enqueueDocumentIngestion,
  waitForIngestionQueue,
  closeIngestionQueue,
};
