const Attempt=require("./attempt.model")
const Problem=require("../problem/problem.model")

const createAttempt=async(problemId,userId)=>{
    if(!userId){
        const error=new Error("Authentication required.")
        error.statusCode=401;
        throw error;
    }
     const problem=await Problem.findOne({_id:problemId})
    if(!problem){
        const error=new Error("Problem Not found.")
        const statusCode=404;
        throw error;
        }
    const attempt=await Attempt.create(
       { 
        problemId,
        userId,
        sessions: [
            {
                startedAt: new Date()
            }
             ]
             }   
    )
   return attempt
}

module.exports={createAttempt}