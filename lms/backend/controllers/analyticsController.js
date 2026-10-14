const Submission = require("../models/Submission");
const QuizAttempt = require("../models/QuizAttempt");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");

// Performance analytics for one student within a course
exports.getStudentPerformance = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const assignments = await Assignment.find({ course: courseId });
    const submissions = await Submission.find({
      student: studentId,
      assignment: { $in: assignments.map((a) => a._id) },
    });
    const avgAssignmentScore =
      submissions.filter((s) => s.marksObtained != null).length > 0
        ? (
            submissions.reduce((sum, s) => sum + (s.marksObtained || 0), 0) /
            submissions.filter((s) => s.marksObtained != null).length
          ).toFixed(2)
        : null;

    const quizzes = await Quiz.find({ course: courseId });
    const attempts = await QuizAttempt.find({
      student: studentId,
      quiz: { $in: quizzes.map((q) => q._id) },
    });
    const avgQuizPercentage =
      attempts.length > 0
        ? (
            attempts.reduce((sum, a) => sum + (a.score / (a.totalMarks || 1)) * 100, 0) / attempts.length
          ).toFixed(2)
        : null;

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
    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : null;

    res.json({
      assignmentsSubmitted: submissions.length,
      totalAssignments: assignments.length,
      avgAssignmentScore,
      quizzesAttempted: attempts.length,
      totalQuizzes: quizzes.length,
      avgQuizPercentage,
      attendancePercentage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Course-wide analytics for faculty dashboard
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("students", "name rollNumber");

    const results = [];
    for (const student of course.students) {
      const assignments = await Assignment.find({ course: courseId });
      const submissions = await Submission.find({
        student: student._id,
        assignment: { $in: assignments.map((a) => a._id) },
      });
      const graded = submissions.filter((s) => s.marksObtained != null);
      const avgScore =
        graded.length > 0
          ? (graded.reduce((sum, s) => sum + s.marksObtained, 0) / graded.length).toFixed(2)
          : null;

      const sessions = await Attendance.find({ course: courseId });
      let present = 0;
      let total = 0;
      sessions.forEach((s) => {
        const rec = s.records.find((r) => String(r.student) === String(student._id));
        if (rec) {
          total += 1;
          if (rec.status === "present" || rec.status === "late") present += 1;
        }
      });
      const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : null;

      results.push({
        student: { _id: student._id, name: student.name, rollNumber: student.rollNumber },
        submissionsCount: submissions.length,
        avgScore,
        attendancePercentage,
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
