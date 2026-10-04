const path = require("path");
const dotenv = require("dotenv");

// Load .env from both server folder and workspace root for seamless development
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const connectDB = require("./config/db");
const problemRoutes = require("./modules/problem/problem.route");
const authRoutes = require("./modules/auth/auth.route");
const attemptRoutes = require("./modules/attempt/attempt.route");
const revisionRoutes = require("./modules/revision/revision.route");
const userRoutes = require("./modules/user/user.route");
const aiRoutes = require("./modules/ai/ai.route");
const companyPrepRoutes = require("./modules/companyPrep/companyPrep.route");

dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
    res.send("APP is healthy");
});
app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
});
app.use("/api/auth", authRoutes);
app.use("/api/problem", problemRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/company-prep", companyPrepRoutes);

module.exports = app;