import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [form, setForm] = useState({ title: "", code: "", description: "" });
  const [error, setError] = useState("");

  const loadMyCourses = () => api.get("/courses").then((res) => setCourses(res.data));
  const loadAllCourses = () => api.get("/courses/all").then((res) => setAllCourses(res.data));

  useEffect(() => {
    loadMyCourses();
    if (user?.role === "student") loadAllCourses();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/courses", form);
      setForm({ title: "", code: "", description: "" });
      loadMyCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create course");
    }
  };

  const handleEnroll = async (id) => {
    await api.post(`/courses/${id}/enroll`);
    loadMyCourses();
    loadAllCourses();
  };

  const enrolledIds = new Set(courses.map((c) => c._id));

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Courses</h1>

      {user?.role === "faculty" && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-8 space-y-3">
          <h2 className="font-semibold">Create a new course</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Course code (unique)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">
            Create Course
          </button>
        </form>
      )}

      <h2 className="font-semibold text-lg mb-3">
        {user?.role === "faculty" ? "Your Courses" : "Enrolled Courses"}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {courses.map((c) => (
          <Link key={c._id} to={`/courses/${c._id}`} className="bg-white p-4 rounded-lg shadow hover:shadow-md">
            <h3 className="font-bold text-indigo-700">{c.title}</h3>
            <p className="text-sm text-gray-500">{c.code}</p>
          </Link>
        ))}
        {courses.length === 0 && <p className="text-gray-500 text-sm">No courses yet.</p>}
      </div>

      {user?.role === "student" && (
        <>
          <h2 className="font-semibold text-lg mb-3">All Available Courses</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {allCourses.map((c) => (
              <div key={c._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-indigo-700">{c.title}</h3>
                  <p className="text-sm text-gray-500">{c.code} • {c.faculty?.name}</p>
                </div>
                {!enrolledIds.has(c._id) && (
                  <button
                    onClick={() => handleEnroll(c._id)}
                    className="bg-indigo-700 text-white px-3 py-1 rounded text-sm hover:bg-indigo-800"
                  >
                    Enroll
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
