const Problem = require("./problem.model");
const PatternService = require("../pattern/pattern.service");

const addProblem = async (problemData) => {
    const problem = new Problem(problemData);
    const saved = await problem.save();

    // Auto-register and persist any new pattern in MongoDB via AI
    if (Array.isArray(problemData.patterns)) {
        for (const pat of problemData.patterns) {
            PatternService.ensurePatternExists(pat).catch(err => {
                console.warn(`Error registering pattern ${pat}:`, err.message);
            });
        }
    }
    return saved;
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
        const raw = filters.pattern.trim();
        const lower = raw.toLowerCase();
        let regexStr;

        if (lower === 'linked list' || lower === 'linkedlist') {
            regexStr = 'linked\\s*list';
        } else if (lower === 'trees' || lower === 'tree') {
            regexStr = 'tree';
        } else if (lower === 'graph' || lower === 'graphs') {
            regexStr = 'graph';
        } else if (lower === 'heap') {
            regexStr = 'heap|priority\\s*queue';
        } else if (lower === 'stack') {
            regexStr = 'stack';
        } else if (lower === 'matrix') {
            regexStr = 'matrix';
        } else if (lower === 'intervals') {
            regexStr = 'interval';
        } else if (lower === 'backtracking') {
            regexStr = 'backtrack';
        } else if (lower === 'trie') {
            regexStr = 'trie';
        } else if (lower === 'greedy') {
            regexStr = 'greedy';
        } else if (lower === 'fast & slow pointers') {
            regexStr = 'fast\\s*&\\s*slow';
        } else if (lower === 'depth-first search') {
            regexStr = 'dfs|depth-first';
        } else if (lower === 'breadth-first search') {
            regexStr = 'bfs|breadth-first';
        } else {
            regexStr = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
        }

        query.patterns = { $regex: regexStr, $options: 'i' };
    }
    if (filters.tier && filters.tier !== 'all') {
        query.tier = filters.tier;
    }
    if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
    }
    if (filters.search) {
        query.title = { $regex: filters.search, $options: "i" };
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = filters.limit !== undefined ? parseInt(filters.limit) : 15;

    // If explicit all=true or limit <= 0, return all records
    if (limit <= 0 || filters.all === true || filters.all === 'true') {
        const problems = await Problem.find(query)
            .select("title difficulty platform patterns estimatedTime status url order tier concepts createdBy createdAt")
            .sort({ order: 1, createdAt: 1 })
            .lean();
        return {
            problems,
            pagination: {
                page: 1,
                limit: problems.length,
                total: problems.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }

    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
        Problem.find(query)
            .select("title difficulty platform patterns estimatedTime status url order tier concepts createdBy createdAt")
            .sort({ order: 1, createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Problem.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
        problems,
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