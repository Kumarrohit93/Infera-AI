const fs = require("fs")
const path = require("path")
const express = require("express")
const cors = require("cors")
const { pool, checkConnection } = require("./config/db")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const employeeRoutes = require("./routes/employee.routes")
const departmentRoutes = require("./routes/department.routes")
const organizationRoutes = require("./routes/organization.routes")
const { notFound, errorHandler } = require("./middleware/errorHandler")
const app = express()
const port = process.env.PORT

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
)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
    credentials: true,
  })
)
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Welcome To Infera AI!")
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/organizations", organizationRoutes)

app.use(notFound)
app.use(errorHandler)

async function startServer() {
  try {
    const connection = await checkConnection()
    const invitationSchema = fs.readFileSync(
      path.join(__dirname, "db", "invitations.sql"),
      "utf8"
    )
    await pool.query(invitationSchema)

    app.listen(port, () => {
      console.log(`Server is listening at port ${port}`)
      console.log(
        `Database connected: ${connection.database}.${connection.schema} at ${connection.now}`
      )
    })
  } catch (err) {
    console.error("Backend startup failed:", err.message)
    await pool.end()
    process.exitCode = 1
  }
}

startServer()