const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

exports.createQuiz = async (req, res) => {
  try {
    const { course, title, duration, startTime, endTime, questions } = req.body;
    const quiz = await Quiz.create({
      course,
      title,
      duration,
      startTime,
      endTime,
      questions,
      createdBy: req.user._id,
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuizzesForCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select("-questions.correctOptionIndex");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Full quiz (with correct answers) for faculty who owns it
exports.getQuizFull = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quiz for student to attempt (no answers exposed)
exports.getQuizForAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.correctOptionIndex");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body; // array of selected option indices
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    let totalMarks = 0;
    quiz.questions.forEach((q, idx) => {
      totalMarks += q.marks;
      if (answers[idx] === q.correctOptionIndex) score += q.marks;
    });

    const attempt = await QuizAttempt.findOneAndUpdate(
      { quiz: quiz._id, student: req.user._id },
      { answers, score, totalMarks, submittedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id }).populate(
      "student",
      "name email rollNumber"
    );
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ quiz: req.params.id, student: req.user._id });
    res.json(attempt || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
