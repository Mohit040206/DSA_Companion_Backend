require("dotenv").config();

const mongoose = require("mongoose")

const db=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("db connected")
    }catch(err){
        console.error(err)
        process.exit(1)
    }
}

module.exports=db