const mongoose = require("mongoose");
const Attempt=require("./attempt.model")
const Problem=require("../problem/problem.model")
const Revision=require("../revision/revision.model")
const evaluationService = require("../ai/evaluation.service")

const normalizeOutcome = (raw) => {
    if (!raw) return "Solved";
    const str = String(raw).trim();
    const lower = str.toLowerCase();
    if (lower.includes("clean") || lower === "solved") return "Solved";
    if (lower.includes("hint")) return "SolvedWithHints";
    if (lower.includes("external") || lower.includes("help")) return "SolvedWithExternalHelp";
    if (lower.includes("need") || lower.includes("solution")) return "NeedSolution";
    if (lower.includes("couldnot") || lower.includes("could not") || lower.includes("unsolved")) return "CouldNotSolve";
    return str;
};

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
    if (isPresent.problemId.toString() === problemId.toString()) {
        return isPresent;
    }
    const error = new Error(
        "You already have an active unfinished attempt on another problem. Please complete or submit it first."
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
        const error=new Error("Attempt not found.");
        error.statusCode=404;
        throw error;
    } else if(attempt.completedAt!=null){
        const error=new Error("Attempt already submitted.");
        error.statusCode=409;
        throw error;
    }
    const hasActiveSession = attempt.sessions && attempt.sessions.some(s => !s.endedAt);
    if(hasActiveSession){
        return attempt;
    }
    attempt.sessions.push({
        startedAt: new Date()
    });
    await attempt.save();
    return attempt;
};

const endAttemptSession=async(userId,attemptId)=>{
    const attempt=await Attempt.findOne({_id:attemptId,userId});
    if(!attempt){
        const error=new Error("Attempt not found.");
        error.statusCode=404;
        throw error;
    }
    if (attempt.completedAt) {
        const error = new Error("Attempt already submitted.");
        error.statusCode = 409;
        throw error;
    }
    const activeSession = attempt.sessions && attempt.sessions.find(session => !session.endedAt);
    if (activeSession) {
        activeSession.endedAt = new Date();
        await attempt.save();
    }
    return attempt;
};


const submitAttempt=async(userId,attemptId,data)=>{
    console.log(`[attempt.service:submitAttempt] Received request for userId=${userId}, attemptId=${attemptId}`);

    if(!userId){
        const error=new Error("Authentication required.");
        error.statusCode=401;
        throw error;
    }

    if(!attemptId || !mongoose.isValidObjectId(attemptId)){
        console.error(`[attempt.service:submitAttempt] Invalid attemptId format: "${attemptId}"`);
        const error=new Error(`Invalid attempt ID format: "${attemptId}". Please restart the attempt session.`);
        error.statusCode=400;
        throw error;
    }

    const attempt=await Attempt.findOne({_id:attemptId,userId});

    if(!attempt){
        console.warn(`[attempt.service:submitAttempt] Attempt not found for _id=${attemptId}, userId=${userId}`);
        const error=new Error("Attempt not found in database.");
        error.statusCode=404;
        throw error;
    }

    if(attempt.completedAt!=null){
        console.warn(`[attempt.service:submitAttempt] Attempt ${attemptId} was already submitted at ${attempt.completedAt}`);
        const error=new Error("Attempt has already been submitted.");
        error.statusCode=409;
        throw error;
    }

    const activeSession = attempt.sessions && attempt.sessions.find(session => !session.endedAt);
    if (activeSession) {
        activeSession.endedAt = new Date();
    }
     
    // Normalize and assign Attempt data
    attempt.outcome = normalizeOutcome(data.outcome);
    attempt.hintsUsed = Number(data.hintsUsed ?? data.hints ?? 0) || 0;
    attempt.confidence = Number(data.confidence) || 3;
    if (attempt.confidence < 1) attempt.confidence = 1;
    if (attempt.confidence > 5) attempt.confidence = 5;

    attempt.approach = data.approach;
    attempt.algorithm = data.algorithm;
    attempt.keyInsight = data.keyInsight;
    attempt.mistakes = Array.isArray(data.mistakes) ? data.mistakes : [];
    attempt.complexity = {
        time: data.complexity?.time || "",
        space: data.complexity?.space || ""
    };
    attempt.language = data.language || "JavaScript";
    attempt.code = data.code || data.submittedCode || attempt.code || "";
    if (data.retryOfAttemptId && mongoose.isValidObjectId(data.retryOfAttemptId)) {
        attempt.retryOfAttemptId = data.retryOfAttemptId;
    }

    const providedDuration = Number(data.durationMin);
    if (!isNaN(providedDuration) && providedDuration > 0) {
        attempt.durationMin = providedDuration;
    } else {
        let totalMs = 0;
        const now = Date.now();
        for (const s of (attempt.sessions || [])) {
            const start = s.startedAt ? new Date(s.startedAt).getTime() : 0;
            if (!start) continue;
            const end = s.endedAt ? new Date(s.endedAt).getTime() : now;
            totalMs += Math.max(0, end - start);
        }
        attempt.durationMin = Math.max(1, Math.round(totalMs / 60000));
    }
    if (data.reflection && typeof data.reflection === 'string' && data.reflection.trim()) {
        attempt.reflection = data.reflection.trim();
    } else {
        attempt.reflection = undefined;
    }
    attempt.reflectionNote = data.reflectionNote || "";
    attempt.notes = data.notes;
    attempt.completedAt = new Date();

    console.log(`[attempt.service:submitAttempt] Attempt payload ready. outcome="${attempt.outcome}", hintsUsed=${attempt.hintsUsed}, confidence=${attempt.confidence}`);

    // Update any pending revision for this problem safely
    try {
        const revision = await Revision.findOne({
            userId,
            problemId: attempt.problemId,
            status: "Pending"
        });

        if (revision) {
            revision.status = "Completed";
            revision.completedAt = new Date();
            revision.completedByAttemptId = attempt._id;
            await revision.save();
            console.log(`[attempt.service:submitAttempt] Completed pending revision ${revision._id}`);
        }
    } catch (revErr) {
        console.warn(`[attempt.service:submitAttempt] Non-fatal revision update warning:`, revErr.message);
    }

    // ALWAYS persist Attempt in MongoDB FIRST
    try {
        await attempt.save();
        console.log(`[attempt.service:submitAttempt] Successfully saved attempt ${attempt._id}`);
    } catch (saveErr) {
        console.error(`[attempt.service:submitAttempt] Mongoose save error for attempt ${attemptId}:`, saveErr.message);
        if (saveErr.errors) {
            console.error(`[attempt.service:submitAttempt] Validation details:`, JSON.stringify(saveErr.errors, null, 2));
        }
        saveErr.statusCode = saveErr.name === 'ValidationError' ? 400 : 500;
        throw saveErr;
    }

    // Trigger non-blocking AI evaluation call asynchronously AFTER attempt save
    evaluationService.evaluateAttempt(userId, attempt._id).catch(err => {
        console.error("[attempt.service:submitAttempt] Non-blocking AI evaluation notice for attempt", attempt._id, ":", err.message);
    });

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
    const attempts=await Attempt.find({userId,problemId}).sort({createdAt:-1});
    return attempts || [];
}

const getAllAttempts = async (userId, options = {}) => {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = options.limit !== undefined ? parseInt(options.limit) : 15;
    const query = { userId };

    if (options.outcome && options.outcome !== 'All') {
        if (options.outcome === 'Solved') {
            query.outcome = { $in: ['Solved', 'SolvedClean', 'SolvedWithHints', 'Solved with hints', 'Solved With Hints'] };
        } else if (options.outcome === 'Hints') {
            query.outcome = { $in: ['SolvedWithHints', 'Solved with hints', 'Solved With Hints'] };
        } else if (options.outcome === 'Unsolved') {
            query.outcome = { $in: ['CouldNotSolve', 'Could not solve', 'Could Not Solve', 'NeedSolution', 'Need solution', 'Need Solution'] };
        } else {
            query.outcome = options.outcome;
        }
    }

    if (limit <= 0 || options.all === true || options.all === 'true') {
        const attempts = await Attempt.find(query)
            .populate("problemId", "title difficulty platform patterns")
            .sort({ createdAt: -1 })
            .lean();
        return {
            attempts,
            pagination: {
                page: 1,
                limit: attempts.length,
                total: attempts.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }

    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
        Attempt.find(query)
            .populate("problemId", "title difficulty platform patterns")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Attempt.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
        attempts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

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


