const jwt = require("jsonwebtoken");
const User = require("../models/User");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    // Only allow 'student' or 'faculty' for self-registration — never 'admin'
    const allowedRoles = ["student", "faculty"];
    const safeRole = allowedRoles.includes(role) ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      rollNumber,
      department,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: genToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: genToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
