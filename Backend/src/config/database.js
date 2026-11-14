const mongoose = require('mongooose');
function connectToDb()
{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to Database")
    })
    .catch(err=>{
        console.log("Error connecting ot Database", err)
    })
}
module.exports= connectToDb;