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
        error.statusCode=404;
        throw error;
        }
       const isPresent = await Attempt.findOne({
    userId,
    completedAt: { $exists: false }
});

if (isPresent) {
    const error = new Error(
        "You already have an unfinished attempt. Complete it before starting another."
    );

    error.statusCode = 409;
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

const resumeAttempt=async(userId,attemptId)=>{
    const attempt=await Attempt.findOne({_id:attemptId,userId});
        if(!attempt){
            const error=new Error("Attempt not found.")
            error.statusCode=404
            throw error
        }else if(attempt.completedAt!=null){
            const error=new Error("Attempt already Submitted.")
            error.statusCode=409;
            throw error;
        }
         const problem=await Problem.findOne({_id:attempt.problemId})
    if(!problem){
        const error=new Error("Problem Not found.")
       error.statusCode=404;
        throw error;
        }
        const isActiveSessions=await Attempt.findOne({_id:attemptId,sessions: { $elemMatch: { endedAt: { $exists: false } } }})
        if(isActiveSessions){
            const error=new Error("A session already exist for this attempt complete or end that to start a new one.");
            error.statusCode=409;
            throw error;
        }
        attempt.sessions.push({
            startedAt:new Date()
        })
        await attempt.save();
        return attempt;
}

const endAttemptSession=async(userId,attemptId)=>{
    const attempt=await Attempt.findOne({_id:attemptId,userId});
    if(!attempt){
        const error=new Error("No attempt's Session found.")
        error.statusCode=404;
        throw error;
    }
       if (attempt.completedAt) {
        const error = new Error("Attempt already submitted.");
        error.statusCode = 409;
        throw error;
    }
    
 const activeSession = attempt.sessions.find(session => !session.endedAt);

    if (!activeSession) {
        const error = new Error("No active session found to end for this attempt.");
        error.statusCode = 409;
        throw error;
    }

    activeSession.endedAt = new Date();
    await attempt.save();
    return attempt;
}


const submitAttempt=async(userId,attemptId,data)=>{
    const attempt=await Attempt.findOne({_id:attemptId,userId})

    if(!attempt){
        const error=new Error("Attempt not found.")
        error.statusCode=404
        throw error;
    }
    if(attempt.completedAt!=null){
        const error=new Error("Attempt already submitted.")
        error.statusCode=409
        throw error
    }
    const activeSession = attempt.sessions.find(
    session => !session.endedAt
);

if (activeSession) {
    activeSession.endedAt = new Date();
}
     
    //  Attempt data
    attempt.outcome=data.outcome;
    attempt.hintsUsed=data.hintsUsed??0;
    attempt.confidence=data.confidence;
    attempt.approach=data.approach;
    attempt.algorithm=data.algorithm;
    attempt.keyInsight=data.keyInsight;
    attempt.mistakes=data.mistakes;
    attempt.complexity={
        time:data.complexity?.time,
        space:data.complexity?.space
    }
    attempt.language = data.language;

    attempt.reflection = data.reflection;
    attempt.reflectionNote = data.reflectionNote;

    attempt.notes = data.notes;

  
    attempt.completedAt = new Date();

    await attempt.save();

    return attempt;

}
module.exports={createAttempt,resumeAttempt,endAttemptSession,submitAttempt}


