const Submission = require("../models/Submission");
const QuizAttempt = require("../models/QuizAttempt");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

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
    res.status(500).json({ message: "Failed to load performance data" });
  }
};

// Course-wide analytics for faculty dashboard
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("students", "name rollNumber");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const assignments = await Assignment.find({ course: courseId });
    const sessions = await Attendance.find({ course: courseId });

    const results = [];
    for (const student of course.students) {
      const submissions = await Submission.find({
        student: student._id,
        assignment: { $in: assignments.map((a) => a._id) },
      });
      const graded = submissions.filter((s) => s.marksObtained != null);
      const avgScore =
        graded.length > 0
          ? (graded.reduce((sum, s) => sum + s.marksObtained, 0) / graded.length).toFixed(2)
          : null;

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
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

// Dashboard summary stats — computed from real DB data
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    if (role === "student") {
      const enrolledCourses = await Course.find({ students: userId });
      const courseIds = enrolledCourses.map((c) => c._id);
      const assignments = await Assignment.find({ course: { $in: courseIds } });
      const submissions = await Submission.find({
        student: userId,
        assignment: { $in: assignments.map((a) => a._id) },
      });
      const quizzes = await Quiz.find({ course: { $in: courseIds } });
      const attempts = await QuizAttempt.find({
        student: userId,
        quiz: { $in: quizzes.map((q) => q._id) },
      });

      // Calculate overall attendance
      const sessions = await Attendance.find({ course: { $in: courseIds } });
      let present = 0;
      let total = 0;
      sessions.forEach((s) => {
        const rec = s.records.find((r) => String(r.student) === String(userId));
        if (rec) {
          total += 1;
          if (rec.status === "present" || rec.status === "late") present += 1;
        }
      });

      res.json({
        enrolledCourses: enrolledCourses.length,
        totalAssignments: assignments.length,
        submittedAssignments: submissions.length,
        pendingAssignments: assignments.length - submissions.length,
        totalQuizzes: quizzes.length,
        attemptedQuizzes: attempts.length,
        attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(2) : "N/A",
        recentCourses: enrolledCourses.slice(0, 5).map((c) => ({ _id: c._id, title: c.title, code: c.code })),
      });
    } else if (role === "faculty") {
      const teachingCourses = await Course.find({ faculty: userId });
      const courseIds = teachingCourses.map((c) => c._id);
      const totalStudents = new Set();
      teachingCourses.forEach((c) => c.students.forEach((s) => totalStudents.add(String(s))));
      const assignments = await Assignment.find({ course: { $in: courseIds } });
      const pendingSubmissions = await Submission.countDocuments({
        assignment: { $in: assignments.map((a) => a._id) },
        status: { $in: ["submitted", "late"] },
      });
      const quizzes = await Quiz.find({ course: { $in: courseIds } });

      res.json({
        teachingCourses: teachingCourses.length,
        totalStudents: totalStudents.size,
        totalAssignments: assignments.length,
        pendingGrading: pendingSubmissions,
        totalQuizzes: quizzes.length,
        recentCourses: teachingCourses.slice(0, 5).map((c) => ({ _id: c._id, title: c.title, code: c.code })),
      });
    } else {
      // admin
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalFaculty = await User.countDocuments({ role: "faculty" });

      res.json({
        totalUsers,
        totalCourses,
        totalStudents,
        totalFaculty,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
