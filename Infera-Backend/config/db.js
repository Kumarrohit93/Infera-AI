const { Pool } = require("pg")
const { databaseUrl } = require("./env")

const pool = new Pool({ connectionString: databaseUrl })

async function checkConnection() {
  const result = await pool.query("SELECT NOW() AS now")
  return result.rows[0].now
}

module.exports = { pool, checkConnection }