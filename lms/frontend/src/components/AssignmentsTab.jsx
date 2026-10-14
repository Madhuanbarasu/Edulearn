import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AssignmentsTab({ courseId, user }) {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxMarks: 100 });
  const [expanded, setExpanded] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [mySubs, setMySubs] = useState({});

  const load = () => api.get(`/assignments/course/${courseId}`).then((res) => setAssignments(res.data));

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/assignments", { ...form, course: courseId });
    setForm({ title: "", description: "", dueDate: "", maxMarks: 100 });
    load();
  };

  const loadSubmissions = async (assignmentId) => {
    if (user.role === "faculty") {
      const res = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions((s) => ({ ...s, [assignmentId]: res.data }));
    } else {
      const res = await api.get(`/assignments/${assignmentId}/my-submission`);
      setMySubs((s) => ({ ...s, [assignmentId]: res.data }));
    }
  };

  const toggleExpand = (a) => {
    const next = expanded === a._id ? null : a._id;
    setExpanded(next);
    if (next) loadSubmissions(a._id);
  };

  const handleSubmit = async (assignmentId, file, textAnswer) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    if (textAnswer) fd.append("textAnswer", textAnswer);
    await api.post(`/assignments/${assignmentId}/submit`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    loadSubmissions(assignmentId);
  };

  const handleGrade = async (submissionId, marksObtained, feedback, assignmentId) => {
    await api.put(`/assignments/submissions/${submissionId}/grade`, { marksObtained, feedback });
    loadSubmissions(assignmentId);
  };

  return (
    <div>
      {user.role === "faculty" && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <h3 className="font-semibold">New Assignment</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border rounded px-3 py-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" />
          <div className="flex gap-3">
            <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required className="border rounded px-3 py-2 flex-1" />
            <input type="number" placeholder="Max marks" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} className="border rounded px-3 py-2 w-32" />
          </div>
          <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">Create</button>
        </form>
      )}

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(a)}>
              <div>
                <h4 className="font-semibold">{a.title}</h4>
                <p className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleString()} • Max marks: {a.maxMarks}</p>
              </div>
              <span className="text-indigo-700 text-sm">{expanded === a._id ? "Hide" : "View"}</span>
            </div>

            {expanded === a._id && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">{a.description}</p>

                {user.role === "student" && (
                  <StudentSubmissionForm
                    assignment={a}
                    mySubmission={mySubs[a._id]}
                    onSubmit={(file, text) => handleSubmit(a._id, file, text)}
                  />
                )}

                {user.role === "faculty" && (
                  <FacultySubmissionsList
                    submissions={submissions[a._id] || []}
                    onGrade={(subId, marks, fb) => handleGrade(subId, marks, fb, a._id)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments yet.</p>}
      </div>
    </div>
  );
}

function StudentSubmissionForm({ mySubmission, onSubmit }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  return (
    <div>
      {mySubmission ? (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p>Status: <strong>{mySubmission.status}</strong></p>
          {mySubmission.marksObtained != null && <p>Marks: {mySubmission.marksObtained}</p>}
          {mySubmission.feedback && <p>Feedback: {mySubmission.feedback}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-2">Not submitted yet.</p>
      )}
      <div className="flex gap-2 mt-3 flex-wrap items-center">
        <textarea placeholder="Text answer (optional)" value={text} onChange={(e) => setText(e.target.value)} className="border rounded px-3 py-2 flex-1" />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        <button onClick={() => onSubmit(file, text)} className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 text-sm">
          {mySubmission ? "Re-submit" : "Submit"}
        </button>
      </div>
    </div>
  );
}

function FacultySubmissionsList({ submissions, onGrade }) {
  return (
    <div className="space-y-2">
      {submissions.map((s) => (
        <GradeRow key={s._id} submission={s} onGrade={onGrade} />
      ))}
      {submissions.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
    </div>
  );
}

function GradeRow({ submission, onGrade }) {
  const [marks, setMarks] = useState(submission.marksObtained ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  return (
    <div className="border rounded p-3 flex justify-between items-center flex-wrap gap-2">
      <div>
        <p className="font-medium text-sm">{submission.student?.name} ({submission.student?.rollNumber})</p>
        <p className="text-xs text-gray-500">Status: {submission.status}</p>
      </div>
      <div className="flex gap-2 items-center">
        <input type="number" placeholder="Marks" value={marks} onChange={(e) => setMarks(e.target.value)} className="border rounded px-2 py-1 w-20 text-sm" />
        <input placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        <button onClick={() => onGrade(submission._id, Number(marks), feedback)} className="bg-indigo-700 text-white px-3 py-1 rounded text-sm hover:bg-indigo-800">
          Save
        </button>
      </div>
    </div>
  );
}
