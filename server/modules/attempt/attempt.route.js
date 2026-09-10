const express=require("express");
const {authMiddleware}=require("../../middleware/auth.middileware")
const {startAttempt}=require("./attempt.controller")
const router=express.Router()


router.post("/start",authMiddleware,startAttempt)

module.exports=router