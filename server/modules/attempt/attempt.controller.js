
const attemptService=require("./attempt.service")

const startAttempt=async(req,res)=>{
    try{
        const userId=req.userId;
        const{problemId}=req.body;
        if(!problemId){
            return res.status(400).json({
                success:false,
                message:"Problem is required to start a attempt.",
                code:400
            })
}
        const attempt=await attemptService.createAttempt(problemId,userId);
        return res.status(201).json({
            success:true,
            message:"attempt registered successfully.",
            code:201,
            data:attempt
        })
    }catch(err){
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        })
    }
}

module.exports={startAttempt}