import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AttendanceTab({ course, user }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});
  const [history, setHistory] = useState([]);
  const [mySummary, setMySummary] = useState(null);

  const loadHistory = () => api.get(`/attendance/course/${course._id}`).then((res) => setHistory(res.data));

  useEffect(() => {
    loadHistory();
    if (user.role === "student") {
      api.get(`/attendance/course/${course._id}/student/${user._id}`).then((res) => setMySummary(res.data));
    }
  }, [course._id]);

  const toggleStatus = (studentId, status) => {
    setStatusMap((m) => ({ ...m, [studentId]: status }));
  };

  const handleSave = async () => {
    const records = (course.students || []).map((s) => ({
      student: s._id,
      status: statusMap[s._id] || "present",
    }));
    await api.post("/attendance", { course: course._id, date, records });
    loadHistory();
  };

  if (user.role === "student") {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Your Attendance</h3>
        {mySummary ? (
          <p className="text-sm">
            Present: {mySummary.present} / {mySummary.total} sessions —{" "}
            <strong>{mySummary.percentage}%</strong>
          </p>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Mark Attendance</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-3 py-2 mb-4" />
        <div className="space-y-2">
          {(course.students || []).map((s) => (
            <div key={s._id} className="flex justify-between items-center border rounded p-2">
              <span className="text-sm">{s.name} ({s.rollNumber})</span>
              <div className="flex gap-2">
                {["present", "absent", "late"].map((st) => (
                  <button
                    key={st}
                    onClick={() => toggleStatus(s._id, st)}
                    className={`px-2 py-1 rounded text-xs ${
                      (statusMap[s._id] || "present") === st
                        ? "bg-indigo-700 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {(!course.students || course.students.length === 0) && (
            <p className="text-sm text-gray-500">No students enrolled yet.</p>
          )}
        </div>
        <button onClick={handleSave} className="mt-4 bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 text-sm">
          Save Attendance
        </button>
      </div>

      <h3 className="font-semibold mb-2">History</h3>
      <div className="space-y-2">
        {history.map((h) => (
          <div key={h._id} className="bg-white rounded p-3 shadow text-sm">
            {new Date(h.date).toLocaleDateString()} — {h.records.filter((r) => r.status !== "absent").length}/{h.records.length} present
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-gray-500">No attendance marked yet.</p>}
      </div>
    </div>
  );
}
