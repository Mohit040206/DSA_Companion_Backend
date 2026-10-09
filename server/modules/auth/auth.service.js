const mongoose=require("mongoose")
const User=require("../user/user.model")
const encrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")

const registerUser=async({username,password,email,name})=>{
    const existingmail=await User.findOne({email});
    if(existingmail){
        const error=new Error("User with this email already exist.")
        error.statusCode=409;
        throw error;
    }
        const existingUserName=await User.findOne({username});
        if(existingUserName){
             const error=new Error(`The username ${username} is already taken by someone please try something else.`)
        error.statusCode=409;
        throw error;
        }
        const saltRounds=10;
        const hashedPassword=await encrypt.hash(password,saltRounds);

        const newUser=new User({
            name,
            email,
            username,
            password:hashedPassword,
            role:"user"
        })
       await newUser.save();
       const token=  jwt.sign(
        {
            userId:newUser._id
         },
        process.env.SECERATE_KEY,
    {
        expiresIn:"1d"
    }
)
        return {
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                learningProfile: newUser.learningProfile,
                isOnboarded: newUser.isOnboarded
            },
            token
        };
}

const userLogin=async({username,email,password})=>{
     const query = username
        ? { username }
        : { email };
    
        const user=await User.findOne(query).select("+password");
        if (!user) {
        const error = new Error("The userName/email and password combination is invalid. Please try again");
        error.statusCode = 401;
        throw error;
    }

        const isValidPassword=await encrypt.compare(password,user.password)

        if(!isValidPassword){
            const error=new Error("The userName/email and password combination is invalid. Please try again")
            error.statusCode=401
            throw error
        }
        const userObj = user.toObject();
        delete userObj.password;

        const token = jwt.sign({ userId: user._id, username: user.username, userRole: user.role }, process.env.SECERATE_KEY || process.env.JWT_SECRET || "defaultsecret", { expiresIn: "1d" });
        return {
            user: userObj,
            token
        };
}

const getUserProfile=async(userId)=>{
    const user = await User.findById(userId);
    if(!user){
        const error=new Error("User not found");
        error.statusCode=404;
        throw error;
    }
    return user;
}

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    if (user.password) {
        const isValid = await encrypt.compare(currentPassword, user.password);
        if (!isValid) {
            const error = new Error("Incorrect current password.");
            error.statusCode = 400;
            throw error;
        }
    }

    const saltRounds = 10;
    user.password = await encrypt.hash(newPassword, saltRounds);
    await user.save();
    return { message: "Password changed successfully." };
};

const crypto = require("crypto");
const emailService = require("./email.service");

const forgotPassword = async (email, originUrl) => {
    if (!email) {
        const error = new Error("Email is required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        // Return generic success to prevent email enumeration
        return { message: "If an account with that email exists, password reset instructions have been sent." };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token expires in 1 hour
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const baseUrl = originUrl || process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
        await emailService.sendPasswordResetEmail(user.email, resetUrl, user.name || user.username);
    } catch (mailErr) {
        console.error("[auth.service:forgotPassword] Error sending reset email:", mailErr.message);
    }

    return { message: "If an account with that email exists, password reset instructions have been sent." };
};

const resetPassword = async (email, token, newPassword) => {
    if (!email || !token || !newPassword) {
        const error = new Error("Email, reset token, and new password are all required.");
        error.statusCode = 400;
        throw error;
    }

    if (newPassword.length < 6) {
        const error = new Error("New password must be at least 6 characters long.");
        error.statusCode = 400;
        throw error;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        email: email.toLowerCase().trim(),
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        const error = new Error("Password reset link is invalid or has expired. Please request a new one.");
        error.statusCode = 400;
        throw error;
    }

    const saltRounds = 10;
    user.password = await encrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: "Password reset successfully! You can now log in with your new password." };
};

module.exports = {
    registerUser,
    userLogin,
    getUserProfile,
    changePassword,
    forgotPassword,
    resetPassword
};