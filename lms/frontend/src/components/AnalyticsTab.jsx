import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AnalyticsTab({ course, user }) {
  const [courseStats, setCourseStats] = useState([]);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    if (user.role === "faculty") {
      api.get(`/analytics/course/${course._id}`).then((res) => setCourseStats(res.data));
    } else {
      api.get(`/analytics/course/${course._id}/student/${user._id}`).then((res) => setMyStats(res.data));
    }
  }, [course._id, user]);

  if (user.role === "student") {
    if (!myStats) return <p className="text-sm text-gray-500">Loading analytics...</p>;
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Assignments Submitted" value={`${myStats.assignmentsSubmitted}/${myStats.totalAssignments}`} />
        <StatCard label="Avg Assignment Score" value={myStats.avgAssignmentScore ?? "N/A"} />
        <StatCard label="Quizzes Attempted" value={`${myStats.quizzesAttempted}/${myStats.totalQuizzes}`} />
        <StatCard label="Avg Quiz %" value={myStats.avgQuizPercentage ? `${myStats.avgQuizPercentage}%` : "N/A"} />
        <StatCard label="Attendance %" value={myStats.attendancePercentage ? `${myStats.attendancePercentage}%` : "N/A"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Student</th>
            <th className="p-3">Submissions</th>
            <th className="p-3">Avg Score</th>
            <th className="p-3">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {courseStats.map((r) => (
            <tr key={r.student._id} className="border-t">
              <td className="p-3">{r.student.name} ({r.student.rollNumber})</td>
              <td className="p-3">{r.submissionsCount}</td>
              <td className="p-3">{r.avgScore ?? "N/A"}</td>
              <td className="p-3">{r.attendancePercentage ?? "N/A"}</td>
            </tr>
          ))}
          {courseStats.length === 0 && (
            <tr><td className="p-3 text-gray-500" colSpan={4}>No students enrolled yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-indigo-700">{value}</p>
    </div>
  );
}
