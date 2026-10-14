const Course = require("../models/Course");
const User = require("../models/User");

exports.createCourse = async (req, res) => {
  try {
    const { title, code, description } = req.body;
    if (!title || !code) {
      return res.status(400).json({ message: "Title and course code are required" });
    }
    const course = await Course.create({
      title,
      code,
      description,
      faculty: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { teachingCourses: course._id } });
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Course code already exists" });
    res.status(500).json({ message: "Failed to create course" });
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
    res.status(500).json({ message: "Failed to load courses" });
  }
};

exports.getAllCoursesPublic = async (req, res) => {
  try {
    const courses = await Course.find().populate("faculty", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load courses" });
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
    res.status(500).json({ message: "Failed to load course" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can update this course" });
    }
    const { title, code, description } = req.body;
    if (title) course.title = title;
    if (code) course.code = code;
    if (description !== undefined) course.description = description;
    await course.save();
    res.json(course);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Course code already exists" });
    res.status(500).json({ message: "Failed to update course" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can delete this course" });
    }
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );
    await User.findByIdAndUpdate(course.faculty, { $pull: { teachingCourses: course._id } });
    await Course.findByIdAndDelete(course._id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.students.map(String).includes(String(req.user._id))) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }
    await Course.findByIdAndUpdate(req.params.id, { $addToSet: { students: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });
    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to enroll" });
  }
};

exports.unenrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    await Course.findByIdAndUpdate(req.params.id, { $pull: { students: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { enrolledCourses: course._id } });
    res.json({ message: "Unenrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unenroll" });
  }
};

exports.addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can add materials" });
    }
    if (!req.body.title) return res.status(400).json({ message: "Material title is required" });
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    if (!fileUrl) return res.status(400).json({ message: "A file is required" });
    course.materials.push({ title: req.body.title, fileUrl });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to upload material" });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (String(course.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can delete materials" });
    }
    course.materials = course.materials.filter(
      (m) => String(m._id) !== String(req.params.materialId)
    );
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete material" });
  }
};

