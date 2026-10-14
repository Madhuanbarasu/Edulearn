const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createCourse,
  getCourses,
  getAllCoursesPublic,
  getCourseById,
  enrollStudent,
  addMaterial,
} = require("../controllers/courseController");

router.use(protect);
router.get("/all", getAllCoursesPublic);
router.get("/", getCourses);
router.post("/", authorize("faculty", "admin"), createCourse);
router.get("/:id", getCourseById);
router.post("/:id/enroll", authorize("student"), enrollStudent);
router.post("/:id/materials", authorize("faculty", "admin"), upload.single("file"), addMaterial);

module.exports = router;
