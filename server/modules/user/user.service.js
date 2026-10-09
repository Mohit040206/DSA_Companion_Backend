const User = require("./user.model");

class UserService {
  async getAllUsers(filters = {}) {
    const { search, status } = filters;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = filters.limit !== undefined ? parseInt(filters.limit) : 15;

    if (limit <= 0 || filters.all === true || filters.all === 'true') {
      const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
      return {
        users,
        pagination: {
          page: 1,
          limit: users.length,
          total: users.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserStatus(userId, status) {
    if (!["Active", "Inactive", "Suspended"].includes(status)) {
      const error = new Error("Invalid status value.");
      error.statusCode = 400;
      throw error;
    }
    return await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password");
  }

  async updateUserRole(userId, role) {
    if (!["user", "admin"].includes(role)) {
      const error = new Error("Invalid role value.");
      error.statusCode = 400;
      throw error;
    }
    return await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
  }

  async updateUserProfile(userId, profileData) {
    const {
      name,
      bio,
      currentCompany,
      targetRole,
      targetCompanies,
      techStack,
      preferredLanguage,
      interviewDate,
      dailyGoal,
      weeklyGoal
    } = profileData;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (currentCompany !== undefined) {
      updateData.currentCompany = typeof currentCompany === "string"
        ? { name: currentCompany, role: "" }
        : currentCompany;
    }
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (targetCompanies !== undefined) {
      updateData.targetCompanies = Array.isArray(targetCompanies)
        ? targetCompanies
        : typeof targetCompanies === "string"
        ? targetCompanies.split(",").map(s => s.trim()).filter(Boolean)
        : [targetCompanies];
    }
    if (techStack !== undefined) {
      updateData.techStack = Array.isArray(techStack)
        ? techStack
        : typeof techStack === "string"
        ? techStack.split(",").map(s => s.trim()).filter(Boolean)
        : [techStack];
    }
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate;
    if (dailyGoal !== undefined) updateData.dailyGoal = parseInt(dailyGoal, 10) || 1;
    if (weeklyGoal !== undefined) updateData.weeklyGoal = parseInt(weeklyGoal, 10) || 5;

    updateData.isProfileComplete = true;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    if (!updatedUser) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    return updatedUser;
  }
}

module.exports = new UserService();
