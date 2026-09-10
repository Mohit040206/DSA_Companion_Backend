const dotenv = require("dotenv");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser=require("cookie-parser")

const connectDB = require("./config/db");
const problemRoutes = require("./modules/problem/problem.route");
const authRoutes=require("./modules/auth/auth.route")
const attemptRoutes=require("./modules/attempt/attempt.route")

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // or true to reflect request origin
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
    res.send("APP is healthy");
});
app.use("/api/auth",authRoutes)
app.use("/api/problem", problemRoutes);
app.use("/api/attempt", attemptRoutes);

module.exports = app;