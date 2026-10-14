const Course = require("../models/Course");
const User = require("../models/User");

exports.createCourse = async (req, res) => {
  try {
    const { title, code, description } = req.body;
    const course = await Course.create({
      title,
      code,
      description,
      faculty: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { teachingCourses: course._id } });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "faculty") filter = { faculty: req.user._id };
    if (req.user.role === "student") filter = { students: req.user._id };
    const courses = await Course.find(filter).populate("faculty", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCoursesPublic = async (req, res) => {
  try {
    const courses = await Course.find().populate("faculty", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email")
      .populate("students", "name email rollNumber");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    await Course.findByIdAndUpdate(req.params.id, { $addToSet: { students: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });
    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.faculty) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the course faculty can add materials" });
    }
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    course.materials.push({ title: req.body.title, fileUrl });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
