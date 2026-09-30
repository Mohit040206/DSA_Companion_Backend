const Attempt=require("./attempt.model")
const Problem=require("../problem/problem.model")
const Revision=require("../revision/revision.model")

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


    const revision = await Revision.findOne({
    userId,
    completedByAttemptId: attempt._id,
    status: "Pending"
});

if (revision) {
    revision.status = "Completed";
    revision.completedAt = new Date();

    await revision.save();
} 

    await attempt.save();

    return attempt;

}

const getAttemptById=async(userId,attemptId)=>{
    const attempt=await Attempt.findOne({userId,_id:attemptId})
    if(!attempt){
        const error=new Error("Attempt not found.")
        error.statusCode=404;
        throw error
    }
    return attempt
}

const getAttemptByProblemId=async(userId,problemId)=>{
    const attempts=await Attempt.find({userId,problemId}).sort({createdAt:-1})
     if (attempts.length === 0) {
    const error = new Error("No attempts found for this problem.");
    error.statusCode = 404;
    throw error;
}
return attempts;

}

const getAllAttempts=async(userId)=>{
    const attempt=await Attempt.find({userId});
    if(!attempt){
        const error=new Error("No attempts found.")
        error.statusCode=404
        throw error;
    }
    return attempt;
}

const bulkImportAttempts = async (userId, records) => {
    if (!userId) {
        const error = new Error("Authentication required.");
        error.statusCode = 401;
        throw error;
    }
    if (!Array.isArray(records) || records.length === 0) {
        const error = new Error("Records must be a non-empty array.");
        error.statusCode = 400;
        throw error;
    }

    let attemptsCreated = 0;
    let newProblemsCreated = 0;
    let matchedProblems = 0;
    const errors = [];

    const getSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/['’]/g, '')
            .replace(/[()]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const validOutcomes = [
        "Solved",
        "SolvedWithHints",
        "SolvedWithExternalHelp",
        "NeedSolution",
        "CouldNotSolve"
    ];

    for (let i = 0; i < records.length; i++) {
        const rec = records[i];
        try {
            const rawTitle = rec.problemTitle || rec.title;
            if (!rawTitle || typeof rawTitle !== 'string') {
                errors.push(`Record #${i + 1}: Missing problem title.`);
                continue;
            }

            const cleanTitle = rawTitle.trim();
            let problem = await Problem.findOne({
                title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            });

            if (!problem) {
                const slug = getSlug(cleanTitle);
                problem = await Problem.findOne({
                    url: { $regex: new RegExp(slug, 'i') }
                });
            }

            if (problem) {
                matchedProblems++;
            } else {
                const slug = getSlug(cleanTitle);
                const diff = (rec.difficulty && ['Easy', 'Medium', 'Hard'].includes(rec.difficulty))
                    ? rec.difficulty
                    : 'Medium';
                const pattern = rec.pattern ? [rec.pattern] : ['Custom'];

                problem = await Problem.create({
                    title: cleanTitle,
                    externalId: rec.externalId || `IMPORT-${Date.now()}-${i}`,
                    platform: rec.platform || 'LeetCode',
                    url: rec.url || `https://leetcode.com/problems/${slug}/`,
                    difficulty: diff,
                    patterns: pattern,
                    estimatedTime: diff === 'Easy' ? 15 : diff === 'Medium' ? 25 : 40,
                    status: 'Not Attempted',
                    learningObjectives: [`Imported record: ${cleanTitle}`],
                    createdBy: userId
                });
                newProblemsCreated++;
            }

            let outcome = rec.outcome || "Solved";
            if (!validOutcomes.includes(outcome)) {
                const lower = String(outcome).toLowerCase();
                if (lower.includes("hint")) outcome = "SolvedWithHints";
                else if (lower.includes("help") || lower.includes("external")) outcome = "SolvedWithExternalHelp";
                else if (lower.includes("need") || lower.includes("solution")) outcome = "NeedSolution";
                else if (lower.includes("could not") || lower.includes("fail")) outcome = "CouldNotSolve";
                else outcome = "Solved";
            }

            let conf = parseInt(rec.confidence, 10);
            if (isNaN(conf) || conf < 1 || conf > 5) conf = 4;

            let mistakesList = [];
            if (Array.isArray(rec.mistakes)) {
                mistakesList = rec.mistakes;
            } else if (typeof rec.mistakes === 'string' && rec.mistakes.trim()) {
                mistakesList = rec.mistakes.split(/[,;\n]/).map(m => m.trim()).filter(Boolean);
            }

            const attemptDate = rec.date ? new Date(rec.date) : new Date();
            const validDate = isNaN(attemptDate.getTime()) ? new Date() : attemptDate;

            await Attempt.create({
                userId,
                problemId: problem._id,
                sessions: [
                    {
                        startedAt: validDate,
                        endedAt: validDate
                    }
                ],
                outcome,
                hintsUsed: parseInt(rec.hintsUsed, 10) || 0,
                confidence: conf,
                approach: rec.approach || '',
                algorithm: rec.algorithm || '',
                keyInsight: rec.keyInsight || rec.keyInsights || '',
                mistakes: mistakesList,
                complexity: {
                    time: rec.timeComplexity || rec.time || (rec.complexity ? rec.complexity.time : ''),
                    space: rec.spaceComplexity || rec.space || (rec.complexity ? rec.complexity.space : '')
                },
                language: rec.language || 'JavaScript',
                notes: rec.notes || '',
                completedAt: validDate,
                createdAt: validDate
            });

            attemptsCreated++;
        } catch (err) {
            console.error(`Error importing record #${i + 1}:`, err);
            errors.push(`Record #${i + 1} ("${records[i]?.problemTitle || 'Unknown'}"): ${err.message}`);
        }
    }

    return {
        total: records.length,
        attemptsCreated,
        matchedProblems,
        newProblemsCreated,
        errors
    };
};

module.exports={createAttempt,resumeAttempt,endAttemptSession,submitAttempt,getAttemptById,getAttemptByProblemId,getAllAttempts,bulkImportAttempts}


