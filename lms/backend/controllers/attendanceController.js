const Attendance = require("../models/Attendance");
const Course = require("../models/Course");

exports.markAttendance = async (req, res) => {
  try {
    const { course, date, records } = req.body; // records: [{student, status}]
    if (!course || !date || !records?.length) {
      return res.status(400).json({ message: "Course, date, and records are required" });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found" });
    if (String(courseDoc.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can mark attendance" });
    }

    const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    const attendance = await Attendance.findOneAndUpdate(
      { course, date: normalizedDate },
      { course, date: normalizedDate, markedBy: req.user._id, records },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};

exports.getAttendanceForCourse = async (req, res) => {
  try {
    const records = await Attendance.find({ course: req.params.courseId })
      .populate("records.student", "name rollNumber")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to load attendance" });
  }
};

exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Student can only view their own summary unless faculty/admin
    if (req.user.role === "student" && String(req.user._id) !== String(studentId)) {
      return res.status(403).json({ message: "Not authorized to view other students' attendance" });
    }

    const sessions = await Attendance.find({ course: courseId });
    let present = 0;
    let total = 0;
    sessions.forEach((s) => {
      const rec = s.records.find((r) => String(r.student) === String(studentId));
      if (rec) {
        total += 1;
        if (rec.status === "present" || rec.status === "late") present += 1;
      }
    });
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : "0.00";
    res.json({ present, total, percentage });
  } catch (err) {
    res.status(500).json({ message: "Failed to load attendance summary" });
  }
};
