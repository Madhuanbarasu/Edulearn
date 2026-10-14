const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");

exports.createAssignment = async (req, res) => {
  try {
    const { course, title, description, dueDate, maxMarks } = req.body;
    if (!course || !title || !dueDate) {
      return res.status(400).json({ message: "Course, title, and due date are required" });
    }
    // Verify faculty owns the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found" });
    if (String(courseDoc.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can create assignments" });
    }
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const assignment = await Assignment.create({
      course,
      title,
      description,
      dueDate,
      maxMarks: maxMarks || 100,
      attachmentUrl,
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

exports.getAssignmentsForCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load assignments" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const courseDoc = await Course.findById(assignment.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can delete assignments" });
    }
    await Submission.deleteMany({ assignment: assignment._id });
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete assignment" });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const courseDoc = await Course.findById(assignment.course);
    if (!courseDoc || (!courseDoc.students.some(s => String(s) === String(req.user._id)) && req.user.role !== "admin")) {
      return res.status(403).json({ message: "You must be enrolled in the course to submit assignments" });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    if (!fileUrl && !req.body.textAnswer) {
      return res.status(400).json({ message: "Please provide a file or text answer" });
    }
    const status = new Date() > new Date(assignment.dueDate) ? "late" : "submitted";

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      { fileUrl, textAnswer: req.body.textAnswer, submittedAt: new Date(), status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit assignment" });
  }
};

exports.getSubmissionsForAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const courseDoc = await Course.findById(assignment.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these submissions" });
    }

    const submissions = await Submission.find({ assignment: req.params.id }).populate(
      "student",
      "name email rollNumber"
    );
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to load submissions" });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;
    if (marksObtained == null) {
      return res.status(400).json({ message: "Marks are required" });
    }

    const submission = await Submission.findById(req.params.id).populate("assignment");
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const courseDoc = await Course.findById(submission.assignment.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to grade this submission" });
    }

    submission.marksObtained = Number(marksObtained);
    submission.feedback = feedback || "";
    submission.status = "graded";
    await submission.save();

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Failed to grade submission" });
  }
};

exports.getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });
    res.json(submission || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to load submission" });
  }
};
