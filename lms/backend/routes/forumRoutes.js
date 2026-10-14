const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createPost, getPostsForCourse, addComment } = require("../controllers/forumController");

router.use(protect);
router.post("/", createPost);
router.get("/course/:courseId", getPostsForCourse);
router.post("/:id/comments", addComment);

module.exports = router;
