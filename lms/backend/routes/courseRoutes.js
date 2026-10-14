const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createCourse,
  getCourses,
  getAllCoursesPublic,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  addMaterial,
  deleteMaterial,
} = require("../controllers/courseController");

router.use(protect);
router.get("/all", getAllCoursesPublic);
router.get("/", getCourses);
router.post("/", authorize("faculty", "admin"), createCourse);
router.get("/:id", getCourseById);
router.put("/:id", authorize("faculty", "admin"), updateCourse);
router.delete("/:id", authorize("faculty", "admin"), deleteCourse);
router.post("/:id/enroll", authorize("student"), enrollStudent);
router.post("/:id/unenroll", authorize("student"), unenrollStudent);
router.post("/:id/materials", authorize("faculty", "admin"), upload.single("file"), addMaterial);
router.delete("/:id/materials/:materialId", authorize("faculty", "admin"), deleteMaterial);

module.exports = router;
