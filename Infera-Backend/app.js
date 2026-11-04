require("dotenv").config()
const express = require("express")
const { checkConnection } = require("./config/db")
const authRoutes = require("./routes/auth.routes")
const { notFound, errorHandler } = require("./middleware/errorHandler")
const app = express()
const port = process.env.PORT

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Welcome To Infera AI!")
})

app.use("/api/auth", authRoutes)

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