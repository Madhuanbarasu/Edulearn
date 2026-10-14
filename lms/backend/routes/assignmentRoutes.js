const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createAssignment,
  getAssignmentsForCourse,
  deleteAssignment,
  submitAssignment,
  getSubmissionsForAssignment,
  gradeSubmission,
  getMySubmission,
} = require("../controllers/assignmentController");

router.use(protect);
router.post("/", authorize("faculty", "admin"), upload.single("file"), createAssignment);
router.get("/course/:courseId", getAssignmentsForCourse);
router.delete("/:id", authorize("faculty", "admin"), deleteAssignment);
router.post("/:id/submit", authorize("student"), upload.single("file"), submitAssignment);
router.get("/:id/submissions", authorize("faculty", "admin"), getSubmissionsForAssignment);
router.get("/:id/my-submission", authorize("student"), getMySubmission);
router.put("/submissions/:id/grade", authorize("faculty", "admin"), gradeSubmission);

module.exports = router;
