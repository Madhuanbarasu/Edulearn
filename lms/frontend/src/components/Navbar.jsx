import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                EL
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                EduLearn <span className="text-indigo-400 font-semibold text-sm">LMS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/courses")
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Courses
                </Link>

                <div className="h-5 w-px bg-slate-700" />

                {/* User Pill */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize tracking-wider font-mono">
                      {user.role} {user.rollNumber ? `• ${user.rollNumber}` : ""}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 border border-slate-700 transition-all duration-150"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <span className="text-xl font-bold">&times;</span>
              ) : (
                <span className="text-lg font-bold">&#9776;</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-2">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role} {user.rollNumber ? `(${user.rollNumber})` : ""}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-300 hover:text-white"
              >
                Courses
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm text-rose-400 hover:text-rose-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-indigo-400 font-semibold"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
