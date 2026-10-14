const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { course, date, records } = req.body; // records: [{student, status}]
    const attendance = await Attendance.findOneAndUpdate(
      { course, date: new Date(date).setHours(0, 0, 0, 0) },
      { course, date: new Date(date).setHours(0, 0, 0, 0), markedBy: req.user._id, records },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceForCourse = async (req, res) => {
  try {
    const records = await Attendance.find({ course: req.params.courseId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
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
    res.status(500).json({ message: err.message });
  }
};
