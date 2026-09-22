const revisionService=require("./revision.service")

const createRevision=async(req,res)=>{
    try{
        const userId=req.userId;
        const {problemId,sourceAttemptId,focus,reason}=req.body;
        if(!probleamId || !sourceAttemptId || !focus || !reason){
            return res.status(400).json({
                success:false,
                message:"All the fileds are required.",
                code:400
            })
        }
        const revision=await revisionService.startRevision(problemId,sourceAttemptId,userId,reason,focus)
        return res.status(201).json({
            success:true,
            message:"Revision started successfully",
            code:201
        })
    }catch(err){
        console.error(err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        })
    }
}