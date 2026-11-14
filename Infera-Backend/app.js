require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { checkConnection } = require("./config/db")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const { notFound, errorHandler } = require("./middleware/errorHandler")
const app = express()
const port = process.env.PORT

// Only the admin frontend origin may call this API from a browser
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5001",
    credentials: true,
  })
)
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Welcome To Infera AI!")
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(port, async () => {
  console.log(`Server is listening at port ${port}`)
  try {
    const now = await checkConnection()
    console.log("Database connected at", now)
  } catch (err) {
    console.error("Database connection failed:", err.message)
  }
})