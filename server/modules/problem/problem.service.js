const Problem = require("./problem.model");

const addProblem = async (problemData) => {
    const problem = new Problem(problemData);
    return await problem.save();
};

const getAllProblem = async (filters = {}) => {
    const query = {};

    if (filters.difficulty && filters.difficulty !== 'All') {
        query.difficulty = filters.difficulty;
    }
    if (filters.platform && filters.platform !== 'All') {
        query.platform = filters.platform;
    }
    if (filters.pattern && filters.pattern !== 'All') {
        query.patterns = { $in: [filters.pattern] };
    }
    if (filters.search) {
        query.title = { $regex: filters.search, $options: "i" };
    }

    return await Problem.find(query)
        .select("title difficulty platform patterns estimatedTime status url order")
        .lean();
};

const getProblemById = async (id) => {
    try {
        const problem = await Problem.findById(id).populate("createdBy", "name username email");
        if (!problem) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            throw error;
        }
        return problem;
    } catch (err) {
        if (err.name === 'CastError') {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            throw error;
        }
        throw err;
    }
};

const updateProblem = async (id, updateData) => {
    const problem = await Problem.findByIdAndUpdate(id, updateData, { new: true });
    if (!problem) {
        const error = new Error("Problem not found");
        error.statusCode = 404;
        throw error;
    }
    return problem;
};

const deleteProblem = async (id) => {
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) {
        const error = new Error("Problem not found");
        error.statusCode = 404;
        throw error;
    }
    return problem;
};

const bulkAddProblems = async (problemsArray, userId) => {
    const prepared = problemsArray.map(p => ({
        ...p,
        createdBy: userId
    }));
    return await Problem.insertMany(prepared);
};

module.exports = {
    addProblem,
    getAllProblem,
    getProblemById,
    updateProblem,
    deleteProblem,
    bulkAddProblems
};