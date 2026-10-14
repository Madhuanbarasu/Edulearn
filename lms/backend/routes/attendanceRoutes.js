const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  markAttendance,
  getAttendanceForCourse,
  getStudentAttendanceSummary,
} = require("../controllers/attendanceController");

router.use(protect);
router.post("/", authorize("faculty", "admin"), markAttendance);
router.get("/course/:courseId", getAttendanceForCourse);
router.get("/course/:courseId/student/:studentId", getStudentAttendanceSummary);

module.exports = router;
