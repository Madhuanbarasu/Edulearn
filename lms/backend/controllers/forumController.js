const ForumPost = require("../models/ForumPost");
const Course = require("../models/Course");

exports.createPost = async (req, res) => {
  try {
    const { course, title, body } = req.body;
    if (!course || !title || !body) {
      return res.status(400).json({ message: "Course, title, and body are required" });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found" });

    const isFaculty = String(courseDoc.faculty) === String(req.user._id);
    const isEnrolled = courseDoc.students.some((s) => String(s) === String(req.user._id));
    if (!isFaculty && !isEnrolled && req.user.role !== "admin") {
      return res.status(403).json({ message: "You must be enrolled in or teaching this course to post" });
    }

    const post = await ForumPost.create({ course, title, body, author: req.user._id });
    const populated = await post.populate("author", "name role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

exports.getPostsForCourse = async (req, res) => {
  try {
    const posts = await ForumPost.find({ course: req.params.courseId })
      .populate("author", "name role")
      .populate("comments.author", "name role")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load posts" });
  }
};

exports.addComment = async (req, res) => {
  try {
    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const courseDoc = await Course.findById(post.course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found" });

    const isFaculty = String(courseDoc.faculty) === String(req.user._id);
    const isEnrolled = courseDoc.students.some((s) => String(s) === String(req.user._id));
    if (!isFaculty && !isEnrolled && req.user.role !== "admin") {
      return res.status(403).json({ message: "You must be enrolled in or teaching this course to comment" });
    }

    post.comments.push({ author: req.user._id, text: req.body.text.trim() });
    await post.save();
    const populated = await post.populate([
      { path: "author", select: "name role" },
      { path: "comments.author", select: "name role" },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const courseDoc = await Course.findById(post.course);
    const isCourseFaculty = courseDoc && String(courseDoc.faculty) === String(req.user._id);
    const isAuthor = String(post.author) === String(req.user._id);

    if (!isAuthor && !isCourseFaculty && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const courseDoc = await Course.findById(post.course);
    const isCourseFaculty = courseDoc && String(courseDoc.faculty) === String(req.user._id);
    const isAuthor = String(comment.author) === String(req.user._id);

    if (!isAuthor && !isCourseFaculty && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    post.comments.pull(commentId);
    await post.save();
    const populated = await post.populate([
      { path: "author", select: "name role" },
      { path: "comments.author", select: "name role" },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
