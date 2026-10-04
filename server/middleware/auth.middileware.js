const dotenv = require("dotenv");
const jwt=require("jsonwebtoken")

const User = require("../modules/user/user.model");

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Authentication required."
            });
        }

        const decode = jwt.verify(
            token,
            process.env.SECERATE_KEY || process.env.JWT_SECRET || "defaultsecret"
        );

        // Verify user document actually exists in MongoDB
        const existingUser = await User.findById(decode.userId);
        if (!existingUser || existingUser.status === "Suspended") {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "User account no longer exists or is suspended."
            });
        }

        req.user = {
            ...decode,
            role: existingUser.role,
            email: existingUser.email,
            name: existingUser.name
        };
        req.userId = existingUser._id.toString();

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            code: 401,
            message: "Invalid or expired authentication token"
        });
    }
};

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