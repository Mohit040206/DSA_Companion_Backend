const express=require("express");
const {authMiddleware}=require("../../middleware/auth.middileware")
const {register,login,profile,logout,changePassword}=require("./auth.controller")
const router=express.Router();


// Auth APIs 
router.post("/register",register)
router.post("/login",login)
router.get("/me",authMiddleware,profile)
router.post("/logout",authMiddleware,logout)
router.post("/change-password",authMiddleware,changePassword)

module.exports=router;
