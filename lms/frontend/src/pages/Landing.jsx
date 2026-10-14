import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Next-Gen Learning Management System
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none mb-6">
          Empower Learning. <br className="hidden sm:inline" />
          <span className="text-indigo-600">Elevate Achievement.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed">
          EduLearn LMS unites students and educators with real-time course collaboration,
          streamlined assignment grading, interactive quizzes, automated attendance, and deep learning analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
            >
              Go to Your Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
              📚
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Comprehensive Courses</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organized course materials, lecture notes, syllabus tracking, and multi-file resource distribution.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Assignments & Quizzes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Timely submissions, automatic late detection, instant quiz grading, and constructive feedback loops.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Authentic performance data, attendance calculations, forum discussions, and actionable learning insights.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          EduLearn LMS &copy; {new Date().getFullYear()} &bull; Built with MERN Stack
        </div>
      </footer>
    </div>
  );
}
