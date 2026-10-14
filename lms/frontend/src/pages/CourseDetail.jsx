import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AssignmentsTab from "../components/AssignmentsTab";
import QuizzesTab from "../components/QuizzesTab";
import AttendanceTab from "../components/AttendanceTab";
import ForumTab from "../components/ForumTab";
import AnalyticsTab from "../components/AnalyticsTab";
import MaterialsTab from "../components/MaterialsTab";

const TABS = ["Materials", "Assignments", "Quizzes", "Attendance", "Forum", "Analytics"];

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState("Materials");

  useEffect(() => {
    api.get(`/courses/${id}`).then((res) => setCourse(res.data));
  }, [id]);

  if (!course) return <div className="p-8 text-center">Loading course...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold text-indigo-700">{course.title}</h1>
      <p className="text-gray-500 mb-6">{course.code} • Faculty: {course.faculty?.name}</p>

      <div className="flex gap-2 border-b mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t ? "border-b-2 border-indigo-700 text-indigo-700" : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Materials" && <MaterialsTab course={course} user={user} setCourse={setCourse} />}
      {tab === "Assignments" && <AssignmentsTab courseId={id} user={user} />}
      {tab === "Quizzes" && <QuizzesTab courseId={id} user={user} />}
      {tab === "Attendance" && <AttendanceTab course={course} user={user} />}
      {tab === "Forum" && <ForumTab courseId={id} user={user} />}
      {tab === "Analytics" && <AnalyticsTab course={course} user={user} />}
    </div>
  );
}
