import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    department: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Create Account</h2>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
        {form.role === "student" && (
          <input name="rollNumber" placeholder="Roll number" value={form.rollNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        )}
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <button className="w-full bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-indigo-700 underline">Login</Link>
      </p>
    </div>
  );
}
