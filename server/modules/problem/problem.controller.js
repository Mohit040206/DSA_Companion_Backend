const ProblemService = require("./problem.service");

const addProblem = async (req, res) => {
    try {
        const userId=req.userId;
       const { title, externalId, url, difficulty } = req.body;
        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Authentication required",
                code:401
            })
        }
        if (!title || !externalId || !difficulty || !url) {
            return res.status(400).json("Required fields missing");
        }
        const problemData = {
            ...req.body,
            createdBy: userId
        };

        const problem = await ProblemService.addProblem(problemData);

        res.status(201).json({
            success:true,
            message:"Problem created successfully.",
            code:201,
            data:problem
        });
    } catch (err) {
        const statusCode=err.statusCode || 500;
        console.error(err);
        res.status(statusCode).json({
            success:false,
            message:statusCode===500?"Something went wrong.":err.message,
            code:statusCode
        });
    }
};

const listProblem = async (req, res) => {
    try {
        const filter={
            difficulty:req.query.difficulty,
            platform:req.query.platform,
            pattern:req.query.pattern,
            search:req.query.search
        }
        const problems = await ProblemService.getAllProblem(filter)
        res.status(200).json({
            success:true,
            message:"Problem fetch successfully.",
            code:200,
            data:problems
            
        });
    } catch (err) {
        console.error(err.message)
        res.status(500).json({
            success:false,
            message:"Something went wrong",
            code:500
        });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await problemService.getProblemById(id);

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Problem fetched successfully",
            data: problem
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            code: statusCode,
            message: statusCode === 500 ? "Error fetching problem details" : err.message,
            error: err.message
        });
    }
};

module.exports = { addProblem, listProblem,getProblemById };