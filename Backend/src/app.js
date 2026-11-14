require("dotenv").config()
const express=require("express")
const cors = require("cors")

const app= express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))


//ROutes
const songRoutes = require("./routes/song.routes")
app.use("/songs",songRoutes)
module.exports= app