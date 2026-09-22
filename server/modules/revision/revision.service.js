const Revision=require("./revision.model")
const Problem=require("../problem/problem.model")
const Attempt=require("../attempt/attempt.model")


const startRevision=async(problemId,sourceAttemptId,userId,reason,focus)=>{
    const problem=await Problem.findOne({_id:problemId});
    if(!problem){
        const error=new Error("Question not found.")
        error.statusCode=404
        throw error;
    }
    const attempt=await Attempt.findOne({_id:sourceAttemptId,userId});
    if(!attempt){
         const error=new Error("Source attempt not found.")
        error.statusCode=404
        throw error;
    }
   const revision=await Revision.create({
    userId,
    problemId,
    sourceAttemptId,
    reason,
    focus
   }
   )
   return revision
}

module.exports={startRevision}