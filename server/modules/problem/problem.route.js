const {
    addProblem,
    listProblem,
    getProblemById,
    updateProblem,
    deleteProblem,
    bulkUpload,
    reseedProblems
} = require("./problem.controller");
const { authMiddleware, authorize } = require("../../middleware/auth.middileware");

const router = express.Router();

router.post("/", authMiddleware, authorize(["admin"]), addProblem);
router.post("/bulk", authMiddleware, authorize(["admin"]), bulkUpload);
router.post("/reseed", authMiddleware, authorize(["admin", "user"]), reseedProblems);
router.get("/", authMiddleware, authorize(["admin", "user"]), listProblem);
router.get("/:id", authMiddleware, authorize(["admin", "user"]), getProblemById);
router.put("/:id", authMiddleware, authorize(["admin"]), updateProblem);
router.delete("/:id", authMiddleware, authorize(["admin"]), deleteProblem);

module.exports = router;