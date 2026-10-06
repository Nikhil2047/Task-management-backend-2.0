const express = require("express");
const app = express();
const connectDB = require("./config/db");
const apiRouter = require("./routes")
const cors = require("cors")


connectDB()

app.use(cors())
app.use(express.json());
app.use("/api",apiRouter)

app.get("/",(req,res)=>{
    res.send("API is working")
})

app.listen(process.env.PORT || 8080,()=>{
    console.log("Server is  up and running")
})