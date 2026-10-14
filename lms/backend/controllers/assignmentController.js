const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

exports.createAssignment = async (req, res) => {
  try {
    const { course, title, description, dueDate, maxMarks } = req.body;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const assignment = await Assignment.create({
      course,
      title,
      description,
      dueDate,
      maxMarks,
      attachmentUrl,
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignmentsForCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const status = new Date() > assignment.dueDate ? "late" : "submitted";

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      { fileUrl, textAnswer: req.body.textAnswer, submittedAt: new Date(), status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubmissionsForAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id }).populate(
      "student",
      "name email rollNumber"
    );
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marksObtained, feedback, status: "graded" },
      { new: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};
