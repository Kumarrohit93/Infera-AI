require("dotenv").config()
const express = require("express")
const app = express()
const port = process.env.PORT

app.get("/", (req, res) => {
    res.send("Welcome To Infera AI!")
})

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`)
})