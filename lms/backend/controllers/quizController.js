const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");

exports.createQuiz = async (req, res) => {
  try {
    const { course, title, duration, startTime, endTime, questions } = req.body;
    if (!course || !title || !duration || !startTime || !endTime || !questions?.length) {
      return res.status(400).json({ message: "All quiz fields including at least one question are required" });
    }
    // Verify faculty owns the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found" });
    if (String(courseDoc.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can create quizzes" });
    }
    // Validate each question
    for (const q of questions) {
      if (!q.questionText || !q.options || q.options.length < 2) {
        return res.status(400).json({ message: "Each question needs text and at least 2 options" });
      }
      if (q.correctOptionIndex == null || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        return res.status(400).json({ message: "Each question needs a valid correct option index" });
      }
    }
    const quiz = await Quiz.create({
      course,
      title,
      duration: Number(duration),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
      createdBy: req.user._id,
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to create quiz" });
  }
};

exports.getQuizzesForCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select("-questions.correctOptionIndex");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load quizzes" });
  }
};

// Full quiz (with correct answers) for faculty who owns it
exports.getQuizFull = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const courseDoc = await Course.findById(quiz.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view quiz details" });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to load quiz" });
  }
};

// Quiz for student to attempt (no answers exposed)
exports.getQuizForAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.correctOptionIndex");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const courseDoc = await Course.findById(quiz.course);
    if (!courseDoc || (!courseDoc.students.some(s => String(s) === String(req.user._id)) && req.user.role !== "admin")) {
      return res.status(403).json({ message: "You must be enrolled in the course to attempt this quiz" });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to load quiz" });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body; // array of selected option indices
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const courseDoc = await Course.findById(quiz.course);
    if (!courseDoc || (!courseDoc.students.some(s => String(s) === String(req.user._id)) && req.user.role !== "admin")) {
      return res.status(403).json({ message: "You must be enrolled in the course to take this quiz" });
    }

    // Check if already attempted
    const existing = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already attempted this quiz" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    let score = 0;
    let totalMarks = 0;
    quiz.questions.forEach((q, idx) => {
      totalMarks += q.marks;
      if (answers[idx] === q.correctOptionIndex) score += q.marks;
    });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      answers,
      score,
      totalMarks,
      submittedAt: new Date(),
    });

    res.status(201).json(attempt);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already attempted this quiz" });
    }
    res.status(500).json({ message: "Failed to submit quiz" });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const courseDoc = await Course.findById(quiz.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view quiz results" });
    }

    const attempts = await QuizAttempt.find({ quiz: req.params.id }).populate(
      "student",
      "name email rollNumber"
    );
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load results" });
  }
};

exports.getMyAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ quiz: req.params.id, student: req.user._id });
    res.json(attempt || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to load attempt" });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const courseDoc = await Course.findById(quiz.course);
    if (String(courseDoc?.faculty) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the course faculty can delete this quiz" });
    }

    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};
