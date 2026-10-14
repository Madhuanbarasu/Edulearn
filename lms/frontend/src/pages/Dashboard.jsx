import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name} 👋</h1>
      <p className="text-gray-600 mb-8">Role: {user?.role}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/courses" className="block bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="font-semibold text-lg text-indigo-700">Courses</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === "faculty" ? "Create and manage your courses" : "Browse and enroll in courses"}
          </p>
        </Link>
        <div className="block bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold text-lg text-indigo-700">What you can do here</h2>
          <ul className="text-sm text-gray-500 mt-1 list-disc list-inside">
            <li>Assignments &amp; submissions</li>
            <li>Quizzes with auto-grading</li>
            <li>Attendance tracking</li>
            <li>Discussion forums</li>
            <li>Performance analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
