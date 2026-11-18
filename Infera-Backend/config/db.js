const { Pool } = require("pg")
const { databaseUrl } = require("./env")

const pool = new Pool({ connectionString: databaseUrl })

async function checkConnection() {
  const result = await pool.query(
    "SELECT NOW() AS now, current_database() AS database, current_schema() AS schema"
  )
  return result.rows[0]
}

module.exports = { pool, checkConnection }