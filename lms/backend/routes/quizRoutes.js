const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createQuiz,
  getQuizzesForCourse,
  getQuizFull,
  getQuizForAttempt,
  submitQuizAttempt,
  getQuizResults,
  getMyAttempt,
  deleteQuiz,
} = require("../controllers/quizController");

router.use(protect);
router.post("/", authorize("faculty", "admin"), createQuiz);
router.get("/course/:courseId", getQuizzesForCourse);
router.delete("/:id", authorize("faculty", "admin"), deleteQuiz);
router.get("/:id/full", authorize("faculty", "admin"), getQuizFull);
router.get("/:id/attempt", getQuizForAttempt);
router.post("/:id/attempt", authorize("student"), submitQuizAttempt);
router.get("/:id/results", authorize("faculty", "admin"), getQuizResults);
router.get("/:id/my-attempt", authorize("student"), getMyAttempt);

module.exports = router;
