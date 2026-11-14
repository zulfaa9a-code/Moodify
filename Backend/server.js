require("dotenv").config();
const connectToDB = require("./src/config/database");
const {saveSongs}= require("./src/services/storage.service")
const app = require("./src/app")

app.listen(3000,()=>
{
    console.log("Server running on port 3000")
})
connectToDB();
saveSongs();