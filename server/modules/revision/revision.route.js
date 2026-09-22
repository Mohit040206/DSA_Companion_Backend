const express=require("express");

const {authMiddleware,authorize}=require("../../middleware/auth.middileware")
const router=express.Router();

router.post("/",authMiddleware,authorize(["user","admin"]));

module.exports=router