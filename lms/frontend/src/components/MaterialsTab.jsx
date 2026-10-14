import React, { useState } from "react";
import api from "../api/axios";

export default function MaterialsTab({ course, user, setCourse }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const isFaculty = user?.role === "faculty" && String(course.faculty?._id) === String(user._id);

  const handleUpload = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    if (file) fd.append("file", file);
    const res = await api.post(`/courses/${course._id}/materials`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setCourse(res.data);
    setTitle("");
    setFile(null);
  };

  return (
    <div>
      {isFaculty && (
        <form onSubmit={handleUpload} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3 flex-wrap items-center">
          <input
            placeholder="Material title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded px-3 py-2 flex-1"
          />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
          <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">
            Upload
          </button>
        </form>
      )}
      <div className="space-y-2">
        {course.materials?.length ? (
          course.materials.map((m, i) => (
            <a
              key={i}
              href={`${import.meta.env.VITE_API_URL?.replace("/api", "")}${m.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="block bg-white p-3 rounded shadow hover:shadow-md text-indigo-700"
            >
              📄 {m.title}
            </a>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No materials uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
