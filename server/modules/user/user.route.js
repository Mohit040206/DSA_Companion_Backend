const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole
} = require("./user.controller");
const { authMiddleware, authorize } = require("../../middleware/auth.middileware");

const router = express.Router();

router.get("/", authMiddleware, authorize(["admin"]), getAllUsers);
router.get("/:id", authMiddleware, authorize(["admin"]), getUserById);
router.put("/:id/status", authMiddleware, authorize(["admin"]), updateUserStatus);
router.put("/:id/role", authMiddleware, authorize(["admin"]), updateUserRole);

module.exports = router;
