const dotenv = require("dotenv");
const jwt=require("jsonwebtoken")

const authMiddleware=(req,res,next)=>{
    try{
        const token=req.cookies?.token;
        if(!token){
            return res.status(401).json({
                success:false,
                code:401,
                message:"Authtentication required."
            })
        }
        const decode=jwt.verify(
            token,
            process.env.SECERATE_KEY,
        )
        req.user=decode;
        req.userId = decode.userId;
        
        next()
    }catch(err){
        return res.status(401).json({
            success:false,
            code:401,
            message:"Invalid or expired authentication token"
        })
    }
}

const authorize=(allowedRoles = [])=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                success:false,
                message:"Authentication required.",
                code:401
            })
        }
        
        const userRole = req.user.role || req.user.userRole;
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                success:false,
                message:"Access denied.",
                code:403
            })
        }
        next();
    }
}
module.exports={authMiddleware,authorize};