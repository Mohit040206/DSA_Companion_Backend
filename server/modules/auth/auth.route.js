const express=require("express");
const {authMiddleware}=require("../../middleware/auth.middileware")
const {register,login,profile,logout}=require("./auth.controller")
const router=express.Router();


// Auth APIs 
router.post("/register",register)
router.post("/login",login)
router.get("/me",authMiddleware,profile)
router.post("/logout",authMiddleware,logout)

module.exports=router;
