const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getStudentPerformance, getCourseAnalytics, getDashboardStats } = require("../controllers/analyticsController");

router.use(protect);
router.get("/dashboard", getDashboardStats);
router.get("/course/:courseId/student/:studentId", getStudentPerformance);
router.get("/course/:courseId", getCourseAnalytics);

module.exports = router;
