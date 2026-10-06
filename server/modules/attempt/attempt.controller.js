
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
        console.log(`[AttemptController:startAttempt] Successfully started attempt ${attempt._id}`);
        return res.status(201).json({
            success:true,
            message:"Attempt registered successfully.",
            code:201,
            data:attempt
        });
    }catch(err){
        console.error(`[AttemptController:startAttempt] Error:`, err.stack || err.message);
        const statusCode=err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to start attempt.",
            code:statusCode
        });
    }
};

const resumeAttempt=async(req,res)=>{
    const userId=req.userId;
    const {attemptId}=req.params;
    console.log(`[AttemptController:resumeAttempt] User ${userId} resuming attempt ${attemptId}`);

    try{
        if(!attemptId){
            return res.status(400).json({
                success:false,
                message:"Attempt is required to start a session.",
                code:400
            });
        }
        const attempt= await attemptService.resumeAttempt(userId,attemptId);
        console.log(`[AttemptController:resumeAttempt] Successfully resumed attempt ${attemptId}`);
        return res.status(200).json({
            success:true,
            message:"Attempt session resumed successfully.",
            code:200,
            data:attempt
        });
    }catch(err){
        console.error(`[AttemptController:resumeAttempt] Error for attempt ${attemptId}:`, err.stack || err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to resume attempt session.",
            code:statusCode
        });
    }
};

const endAttemptSession=async(req,res)=>{
    const userId=req.userId;
    const {attemptId}=req.params;
    console.log(`[AttemptController:endAttemptSession] User ${userId} pausing attempt ${attemptId}`);

    try{
        if(!attemptId){
            return res.status(400).json({
                success:false,
                message:"Attempt is required to end a session.",
                code:400
            });
        }
        const attempt= await attemptService.endAttemptSession(userId,attemptId);
        console.log(`[AttemptController:endAttemptSession] Successfully paused attempt ${attemptId}`);
        return res.status(200).json({
            success:true,
            message:"Attempt session ended successfully.",
            code:200,
            data:attempt
        });
    }catch(err){
        console.error(`[AttemptController:endAttemptSession] Error for attempt ${attemptId}:`, err.stack || err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to pause attempt session.",
            code:statusCode
        });
    }
};


const submitAttempt=async(req,res)=>{
    const userId=req.userId;
    const {attemptId}=req.params;
    console.log(`[AttemptController:submitAttempt] SUBMIT received for userId=${userId}, attemptId=${attemptId}`);
    console.log(`[AttemptController:submitAttempt] Body received:`, JSON.stringify({
        outcome: req.body?.outcome,
        hintsUsed: req.body?.hintsUsed ?? req.body?.hints,
        confidence: req.body?.confidence,
        language: req.body?.language,
        keyInsight: req.body?.keyInsight ? `${req.body.keyInsight.slice(0, 30)}...` : undefined
    }));

    try{
        if(!attemptId){
            return res.status(400).json({
                success:false,
                message:"Attempt ID is required to submit.",
                code:400
            });
        }

        const {
            outcome,
            hintsUsed,
            hints,
            confidence,
            approach,
            algorithm,
            keyInsight,
            mistakes,
            complexity,
            language,
            durationMin,
            code,
            submittedCode,
            retryOfAttemptId,
            reflection,
            reflectionNote,
            notes
        } = req.body;

        if(!outcome){
            console.warn(`[AttemptController:submitAttempt] Missing outcome in request body.`);
            return res.status(400).json({
                success:false,
                message:"Outcome is required.",
                code:400
            });
        }
        if(confidence===undefined || confidence === null){
            console.warn(`[AttemptController:submitAttempt] Missing confidence in request body.`);
            return res.status(400).json({
                success:false,
                message:"Confidence is required.",
                code:400
            });
        }

        const effectiveHints = hintsUsed !== undefined ? hintsUsed : (hints !== undefined ? hints : 0);

        const attempt=await attemptService.submitAttempt(userId,attemptId,{
            outcome,
            hintsUsed: effectiveHints,
            confidence,
            durationMin,
            approach,
            algorithm,
            keyInsight,
            mistakes,
            complexity,
            language,
            code: code || submittedCode,
            retryOfAttemptId,
            reflection,
            reflectionNote,
            notes
        });

        console.log(`[AttemptController:submitAttempt] Successfully processed submission for attemptId=${attemptId}`);
        return res.status(200).json({
            success:true,
            message:"Attempt submitted successfully.",
            code:200,
            data:attempt
        });
    }catch(err){
        console.error(`[AttemptController:submitAttempt] ❌ SUBMISSION ERROR for attemptId=${attemptId}:`, err.stack || err.message);
        let errorDetails = err.message;
        if (err.errors) {
            errorDetails = Object.values(err.errors).map(e => e.message).join("; ");
            console.error(`[AttemptController:submitAttempt] ❌ Detailed validation errors:`, errorDetails);
        }
        const statusCode=err.statusCode || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500);
        return res.status(statusCode).json({
            success:false,
            message:errorDetails || "Something went wrong saving the attempt.",
            code:statusCode
        });
    }
};


const getAttemptById=async(req,res)=>{
    const userId=req.userId;
    const {attemptId}=req.params;
    try{
        if(!attemptId){
            return res.status(400).json({
                success:false,
                message:"Attempt id is invalid.",
                code:400
            });
        }
        const attempt=await attemptService.getAttemptById(userId,attemptId);
        return res.status(200).json({
            success:true,
            message:"Attempt data fetched successfully",
            code:200,
            data:attempt
        });
    }catch(err){
        console.error(`[AttemptController:getAttemptById] Error for attemptId=${attemptId}:`, err.stack || err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to fetch attempt.",
            code:statusCode
        });
    }
};

const getAttemptByProblemId=async(req,res)=>{
    const userId=req.userId;
    const {problemId}=req.params;
    try{
        const attempts=await attemptService.getAttemptByProblemId(userId,problemId);
        return res.status(200).json({
            success:true,
            message:"Problem history fetched successfully.",
            code:200,
            data:attempts
        });
    }catch(err){
        console.error(`[AttemptController:getAttemptByProblemId] Error for problemId=${problemId}:`, err.stack || err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to fetch problem history.",
            code:statusCode
        });
    }
};

const getAllAttempts=async(req,res)=>{
    const userId=req.userId;
    try{
        const attempts=await attemptService.getAllAttempts(userId);
        return res.status(200).json(attempts);
    }catch(err){
        console.error(`[AttemptController:getAllAttempts] Error for userId=${userId}:`, err.stack || err.message);
        const statusCode=err.statusCode || 500;
        return res.status(statusCode).json({
            success:false,
            message:err.message || "Failed to fetch attempts list.",
            code:statusCode
        });
    }
};

const importUserRecords = async (req, res) => {
    const userId = req.userId;
    try {
        const { records } = req.body;
        console.log(`[AttemptController:importUserRecords] Starting bulk import of ${records?.length} records for userId=${userId}`);

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of records to import.",
                code: 400
            });
        }

        const result = await attemptService.bulkImportAttempts(userId, records);
        console.log(`[AttemptController:importUserRecords] Imported successfully: ${result.attemptsCreated} records created.`);

        return res.status(200).json({
            success: true,
            message: `Successfully imported ${result.attemptsCreated} attempt records.`,
            code: 200,
            data: result
        });
    } catch (err) {
        console.error(`[AttemptController:importUserRecords] Import error for userId=${userId}:`, err.stack || err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Something went wrong during import.",
            code: statusCode
        });
    }
};

module.exports={startAttempt,resumeAttempt,endAttemptSession,submitAttempt,getAttemptById,getAttemptByProblemId,getAllAttempts,importUserRecords};