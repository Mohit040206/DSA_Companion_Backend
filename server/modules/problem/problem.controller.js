const ProblemService = require("./problem.service");

const addProblem = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, difficulty, url } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                code: 401
            });
        }
        if (!title || !difficulty) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }
        const problemData = {
            ...req.body,
            createdBy: userId
        };

        const problem = await ProblemService.addProblem(problemData);

        res.status(201).json({
            success: true,
            message: "Problem created successfully.",
            code: 201,
            data: problem
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        console.error(err);
        res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? "Something went wrong." : err.message,
            code: statusCode
        });
    }
};

const listProblem = async (req, res) => {
    try {
        const filter = {
            difficulty: req.query.difficulty,
            platform: req.query.platform,
            pattern: req.query.pattern,
            search: req.query.search,
            tier: req.query.tier,
            status: req.query.status,
            page: req.query.page,
            limit: req.query.limit,
            all: req.query.all
        };
        const result = await ProblemService.getAllProblem(filter);
        res.status(200).json({
            success: true,
            message: "Problems fetched successfully.",
            code: 200,
            data: result.problems,
            problems: result.problems,
            pagination: result.pagination
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            code: 500
        });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await ProblemService.getProblemById(id);

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Problem fetched successfully",
            data: problem
        });
    } catch (err) {
        console.error(err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            code: statusCode,
            message: statusCode === 500 ? "Error fetching problem details" : err.message,
            error: err.message
        });
    }
};

const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await ProblemService.updateProblem(id, req.body);
        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            code: 200,
            data: problem
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            code: statusCode
        });
    }
};

const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        await ProblemService.deleteProblem(id);
        return res.status(200).json({
            success: true,
            message: "Problem removed successfully",
            code: 200
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            code: statusCode
        });
    }
};

const bulkUpload = async (req, res) => {
    try {
        const userId = req.userId;
        const { problems } = req.body;
        if (!Array.isArray(problems) || problems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid problems array",
                code: 400
            });
        }
        const created = await ProblemService.bulkAddProblems(problems, userId);
        return res.status(201).json({
            success: true,
            message: `${created.length} problems imported successfully`,
            code: 201,
            data: created
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to bulk import problems",
            code: 500
        });
    }
};

const reseedProblems = async (req, res) => {
    try {
        const userId = req.userId;
        const seedModule = require('../../seed400Problems');
        
        // Purge fake variation problems & search URLs
        const deleted = await Problem.deleteMany({
            $or: [
                { title: { $regex: /Variation #/i } },
                { url: { $regex: /search=/i } }
            ]
        });

        const generated = seedModule.buildProblemObjects();
        let addedCount = 0;
        let updatedCount = 0;

        for (const pData of generated) {
            const existing = await Problem.findOne({ title: pData.title });
            if (!existing) {
                await Problem.create({
                    ...pData,
                    createdBy: userId
                });
                addedCount++;
            } else {
                existing.patterns = pData.patterns;
                existing.difficulty = pData.difficulty;
                existing.platform = pData.platform;
                existing.url = pData.url;
                existing.externalId = pData.externalId;
                await existing.save();
                updatedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Purged ${deleted.deletedCount} fake variation problems. Seeded ${generated.length} real LeetCode problems (${addedCount} new added, ${updatedCount} updated).`,
            code: 200,
            data: {
                purged: deleted.deletedCount,
                added: addedCount,
                updated: updatedCount,
                total: generated.length
            }
        });
    } catch (err) {
        console.error("Error in reseedProblems:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Reseed failed",
            code: 500
        });
    }
};

module.exports = {
    addProblem,
    listProblem,
    getProblemById,
    updateProblem,
    deleteProblem,
    bulkUpload,
    reseedProblems
};