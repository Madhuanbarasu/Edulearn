import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/analytics/dashboard");
      setStats(res.data);
    } catch (err) {
      setError("Unable to load live dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 capitalize">
              {user?.role} Portal
            </span>
            {user?.department && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300">
                {user.department}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-xl">
            {user?.role === "faculty"
              ? "Manage your courses, review student submissions, track attendance, and inspect learning outcomes."
              : "Track your course progress, upcoming assignments, quiz performance, and class attendance."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="px-5 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm shadow-md transition"
          >
            {user?.role === "faculty" ? "+ Manage Courses" : "Explore Courses"}
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse h-28"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Student Dashboard View */}
          {user?.role === "student" && stats && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stats.enrolledCourses ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Active courses in your schedule</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Assignments</span>
                    <span className="text-lg">📝</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {stats.submittedAssignments ?? 0} <span className="text-lg font-normal text-slate-400">/ {stats.totalAssignments ?? 0}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {stats.pendingAssignments > 0 ? (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {stats.pendingAssignments} pending
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        All caught up!
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Attempted</span>
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {stats.attemptedQuizzes ?? 0} <span className="text-lg font-normal text-slate-400">/ {stats.totalQuizzes ?? 0}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Evaluated assessments</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
                    <span className="text-lg">📅</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {stats.attendancePercentage !== "N/A" ? `${stats.attendancePercentage}%` : "N/A"}
                  </div>
                  <div className="mt-1">
                    {stats.attendancePercentage !== "N/A" && Number(stats.attendancePercentage) >= 75 ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Good standing (&ge;75%)
                      </span>
                    ) : stats.attendancePercentage !== "N/A" ? (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Low attendance (&lt;75%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No sessions recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Courses List */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">My Enrolled Courses</h2>
                  <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    View All &rarr;
                  </Link>
                </div>

                {stats.recentCourses?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.recentCourses.map((c) => (
                      <Link
                        key={c._id}
                        to={`/courses/${c._id}`}
                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition bg-slate-50/50 hover:bg-white group"
                      >
                        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                          {c.code}
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {c.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">You haven't enrolled in any courses yet.</p>
                    <Link
                      to="/courses"
                      className="mt-3 inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Browse Available Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Faculty Dashboard View */}
          {user?.role === "faculty" && stats && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Courses Teaching</span>
                    <span className="text-lg">📖</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stats.teachingCourses ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Managed courses</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
                    <span className="text-lg">👥</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stats.totalStudents ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Enrolled across all courses</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Assignments</span>
                    <span className="text-lg">📋</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stats.totalAssignments ?? 0}</div>
                  <div className="mt-1">
                    {stats.pendingGrading > 0 ? (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {stats.pendingGrading} need grading
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">All submissions graded</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Created</span>
                    <span className="text-lg">❓</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stats.totalQuizzes ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Auto-graded assessments</p>
                </div>
              </div>

              {/* Teaching Courses List */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Your Active Courses</h2>
                  <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Manage All &rarr;
                  </Link>
                </div>

                {stats.recentCourses?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.recentCourses.map((c) => (
                      <Link
                        key={c._id}
                        to={`/courses/${c._id}`}
                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition bg-slate-50/50 hover:bg-white group"
                      >
                        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                          {c.code}
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {c.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">You haven't created any courses yet.</p>
                    <Link
                      to="/courses"
                      className="mt-3 inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create Your First Course
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Dashboard View */}
          {user?.role === "admin" && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Total Users</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalUsers}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Total Courses</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalCourses}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Students</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalStudents}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Faculty</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalFaculty}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
