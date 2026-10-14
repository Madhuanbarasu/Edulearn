import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function ForumTab({ courseId, user }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [commentText, setCommentText] = useState({});

  const load = () => api.get(`/forum/course/${courseId}`).then((res) => setPosts(res.data));
  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/forum", { ...form, course: courseId });
    setForm({ title: "", body: "" });
    load();
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]) return;
    await api.post(`/forum/${postId}/comments`, { text: commentText[postId] });
    setCommentText((c) => ({ ...c, [postId]: "" }));
    load();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
        <h3 className="font-semibold">Start a Discussion</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border rounded px-3 py-2" />
        <textarea placeholder="What's on your mind?" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required className="w-full border rounded px-3 py-2" />
        <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">Post</button>
      </form>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p._id} className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold">{p.title}</h4>
            <p className="text-xs text-gray-500 mb-2">by {p.author?.name} ({p.author?.role})</p>
            <p className="text-sm mb-3">{p.body}</p>

            <div className="border-t pt-3 space-y-2">
              {p.comments.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded p-2 text-sm">
                  <strong>{c.author?.name}:</strong> {c.text}
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  placeholder="Write a comment..."
                  value={commentText[p._id] || ""}
                  onChange={(e) => setCommentText((c) => ({ ...c, [p._id]: e.target.value }))}
                  className="flex-1 border rounded px-3 py-1 text-sm"
                />
                <button onClick={() => handleComment(p._id)} className="bg-indigo-700 text-white px-3 py-1 rounded text-sm hover:bg-indigo-800">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-gray-500 text-sm">No discussions yet. Start one!</p>}
      </div>
    </div>
  );
}
