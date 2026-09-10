const express=require("express")
const AuthService=require("./auth.service")
const User=require("../user/user.model")

// Register
const register=async(req,res)=>{
    try{
        const {username,password,email,name}=req.body;
        if(!username || !password || !email || !name){
            return res.status(400).json({
                success:false,
                code:400,
                message:"All fields are required please fill all of them to continue"
            })
        }
            const {user,token}=await AuthService.registerUser({name,email,password,username});
            res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days in milliseconds
        });
            return res.status(201).json({
                success:true,
                code:201,
                message:"User registered successfully",
                data:user

            })
        

    }catch(err){
        const statusCode= err.statusCode ||500;
        return res.status(statusCode).json({
         success:false,
         code:statusCode,
         message: statusCode === 500 ? "Something went wrong" : err.message,
         error:err.message,
        })
    }
}


// Login
const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if ((!username && !email) || !password) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Please enter your password and either username or email."
            });
        }

        const { user, token } = await AuthService.userLogin({ username, email, password });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Fixed: Boolean evaluation
            sameSite: "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            code: 200,
            data: user
        });

    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? "Something went wrong" : err.message, // Fixed: Send dynamic message
            code: statusCode,
            error: err.message
        });
    }
};

// Profile
const profile=async(req,res)=>{
    try{
       const userId=req.userId;
       const user=await AuthService.getUserProfile(userId);
       return res.status(200).json({
        success:true,
        code:200,
        message:"User Fetched successfully",
        data:user
       })
    }catch(err){
        const statusCode=err.statusCode
       return res.status(500).json({
        success:false,
        code:statusCode,
        message:statusCode===500?"Something went wrong":err.message,
        error:err.message
       }) 
    }
}
const logout=async(req,res)=>{
    try{
    res.clearCookie("token",{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict"
    })
    return res.status(200).json({
        success:true,
        code:200,
        message:"Logged out successfully"
    })
}catch(err){
    console.error(err.message)
    return res.status(500).json({
        success:false,
        code:500,
        message:"Something went wrong."
    })
}
}

module.exports={register,login,profile,logout}