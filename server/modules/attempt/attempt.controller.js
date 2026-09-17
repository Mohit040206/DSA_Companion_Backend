
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
        console.error(err.message)
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        })
    }
}

const resumeAttempt=async(req,res)=>{
    try{
            const userId=req.userId;
            const {attemptId}=req.params;
            if(!attemptId){
                return res.status(400).json({
                    success:false,
                    message:"Attempt is required to start a session.",
                    code:400
                })
            }
            const attempt= await attemptService.resumeAttempt(userId,attemptId);
            return res.status(201).json({
                success:true,
                message:"Attempt session start successfully.",
                code:201
            })
            

    }catch(err){
        console.error(err.message)
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json(
            {
                success:false,
                message:"Something went wrong",
                err:err.message,
                code:statusCode
            }
        )
    }
}

const endAttemptSession=async(req,res)=>{
    try{
        const userId=req.userId;
        const {attemptId}=req.params;
            if(!attemptId){
                return res.status(400).json({
                    success:false,
                    message:"Attempt is required to start a session.",
                    code:400
                })
            }
            const attempt= await attemptService.endAttemptSession(userId,attemptId);
            return res.status(201).json({
                success:true,
                message:"Attempt session end successfully.",
                code:201
            })

    }catch(err){
        console.error(err.message)
        const statusCode=err.statusCode || 500
        return res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        })
    }
}


const submitAttempt=async(req,res)=>{
try{
    const userId=req.userId;
    const {attemptId}=req.params;

    if(!attemptId){
        return res.status(400).json({
            success:false,
            message:"Attempt is required to submit.",
            code:400
        })
    }

        const {
            outcome,
            hintsUsed,
            confidence,
            approach,
            algorithm,
            keyInsight,
            mistakes,
            complexity,
            language,
            reflection,
            reflectionNote,
            notes
        } = req.body;

        if(!outcome){
            return res.status(400).json({
                success:false,
                message:"Outcome is required.",
                code:400
            })
        }
        if(confidence===undefined || confidence === null){
            return res.status(400).json({
                success:false,
                message:"Confidence is required.",
                code:400
            })
        }
        const attempt=await attemptService.submitAttempt(userId,attemptId,{
              outcome,
            hintsUsed,
            confidence,
            approach,
            algorithm,
            keyInsight,
            mistakes,
            complexity,
            language,
            reflection,
            reflectionNote,
            notes
        })
        return res.status(200).json({
            success:true,
            message:"Attempt submitted successfully.",
            code:200,
            data:attempt
        })

}catch(err){
    console.error(err.message)
        const statusCode=err.statusCode || 500
        return res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        })
}
}

module.exports={startAttempt,resumeAttempt,endAttemptSession,submitAttempt}