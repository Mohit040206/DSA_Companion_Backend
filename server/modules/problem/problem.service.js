const Problem = require("./problem.model");

const addProblem = async (problemData) => {
    const problem = new Problem(problemData);
    return await problem.save();
};

const getAllProblem=async(filters={})=>{
const query = {};

    if (filters.difficulty) {
        query.difficulty = filters.difficulty;
    }
    if (filters.platform) {
        query.platform = filters.platform;
    }
    if (filters.pattern) {
        query.patterns = { $in: [filters.pattern] };
    }
    if (filters.search) {
        query.title = { $regex: filters.search, $options: "i" };
    }

    return await Problem.find(query).populate("createdBy", "name username email");
};

const getProblemById = async (id) => {
    const problem = await Problem.findById(id).populate("createdBy", "name username email");
    if (!problem) {
        const error = new Error("Problem not found");
        error.statusCode = 404;
        throw error;
    }
    return problem;
};

module.exports = { addProblem,getAllProblem,getProblemById };