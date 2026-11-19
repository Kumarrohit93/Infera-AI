require("./Config/env");

const pool = require("./Config/db");
const { initDb } = require("./Config/initDb");
const { startIngestionWorker, closeIngestionWorker } = require("./Services/ingestionWorker");
let startupPromise;
let shutdownPromise;
let shutdownRequested = false;

async function startWorker() {
  await initDb();
  if (shutdownRequested) return;
  await startIngestionWorker();
}

async function shutdown() {
  shutdownRequested = true;
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = (async () => {
    if (startupPromise) await startupPromise.catch(() => {});
    await closeIngestionWorker();
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
