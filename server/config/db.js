require("dotenv").config();

const mongoose = require("mongoose")

const db = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dsa_tracker";
        await mongoose.connect(mongoUri);
        console.log("DB connected successfully to:", mongoUri);
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
};

module.exports=db