const express=require("express");
const {authMiddleware, authorize}=require("../../middleware/auth.middileware")
const {
    startAttempt,resumeAttempt,endAttemptSession,submitAttempt,
        getAttemptById,getAttemptByProblemId
    }=require("./attempt.controller")
const router=express.Router()


router.post("/start",authMiddleware,authorize(["user","admin"]),startAttempt)
router.post("/session/:attemptId/resume",authMiddleware,authorize(["user","admin"]),resumeAttempt)
router.post("/session/:attemptId/end",authMiddleware,authorize(["user","admin"]),endAttemptSession)
router.post("/:attemptId/submit",authMiddleware,authorize(["admin","user"]),submitAttempt)
router.get("/:attemptId",authMiddleware,authorize(["user","admin"]),getAttemptById)
router.get("/problem/:problemId",authMiddleware,authorize(["user","admin"]),getAttemptByProblemId)


module.exports=router