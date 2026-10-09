const userService = require("./user.service");

const getAllUsers = async (req, res) => {
    try {
        const result = await userService.getAllUsers(req.query);
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            code: 200,
            data: result.users,
            users: result.users,
            pagination: result.pagination
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Failed to fetch users",
            code: statusCode
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        return res.status(200).json({
            success: true,
            code: 200,
            data: user
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Failed to fetch user",
            code: statusCode
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await userService.updateUserStatus(id, status);
        return res.status(200).json({
            success: true,
            message: "User status updated",
            data: user
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Failed to update user status",
            code: statusCode
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await userService.updateUserRole(id, role);
        return res.status(200).json({
            success: true,
            message: "User role updated",
            data: user
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Failed to update user role",
            code: statusCode
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            code: 200,
            data: updatedUser
        });
    } catch (err) {
        console.error("Error in updateProfile:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Failed to update profile.",
            code: statusCode
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    updateProfile
};
