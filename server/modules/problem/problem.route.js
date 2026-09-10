const express=require("express")
const problem=require("./problem.model")
const {addProblem,listProblem,getProblemById}=require("./problem.controller")
const {authMiddleware,authorize}=require("../../middleware/auth.middileware")


const router=express.Router()

router.post("/",authMiddleware,authorize(["admin"]),addProblem);
router.get("/",authMiddleware,authorize(["admin","user"]),listProblem)
router.get("/:id",authMiddleware,authorize(["admin","user"]),getProblemById)

module.exports=router