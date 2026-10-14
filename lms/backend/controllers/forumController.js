const ForumPost = require("../models/ForumPost");

exports.createPost = async (req, res) => {
  try {
    const { course, title, body } = req.body;
    const post = await ForumPost.create({ course, title, body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ author: req.user._id, text: req.body.text });
    await post.save();
    const populated = await post.populate("comments.author", "name role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
