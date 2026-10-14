import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function QuizzesTab({ courseId, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const load = () => api.get(`/quizzes/course/${courseId}`).then((res) => setQuizzes(res.data));
  useEffect(() => { load(); }, [courseId]);

  return (
    <div>
      {user.role === "faculty" && (
        <div className="mb-6">
          <button onClick={() => setCreating(!creating)} className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 text-sm">
            {creating ? "Cancel" : "+ New Quiz"}
          </button>
          {creating && <QuizCreateForm courseId={courseId} onCreated={() => { setCreating(false); load(); }} />}
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((q) => (
          <div key={q._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{q.title}</h4>
                <p className="text-xs text-gray-500">
                  {q.questions.length} questions • {q.duration} min •
                  {" "}{new Date(q.startTime).toLocaleString()} - {new Date(q.endTime).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setActiveQuiz(activeQuiz === q._id ? null : q._id)} className="text-indigo-700 text-sm">
                {activeQuiz === q._id ? "Close" : user.role === "student" ? "Attempt/View" : "View Results"}
              </button>
            </div>
            {activeQuiz === q._id && (
              user.role === "student"
                ? <StudentQuiz quizId={q._id} />
                : <FacultyResults quizId={q._id} />
            )}
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-gray-500 text-sm">No quizzes yet.</p>}
      </div>
    </div>
  );
}

function QuizCreateForm({ courseId, onCreated }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, marks: 1 },
  ]);

  const updateQuestion = (idx, field, value) => {
    const next = [...questions];
    next[idx][field] = value;
    setQuestions(next);
  };
  const updateOption = (qIdx, oIdx, value) => {
    const next = [...questions];
    next[qIdx].options[oIdx] = value;
    setQuestions(next);
  };
  const addQuestion = () =>
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, marks: 1 }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/quizzes", { course: courseId, title, duration, startTime, endTime, questions });
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mt-3 space-y-4">
      <input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded px-3 py-2" />
      <div className="flex gap-3">
        <input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} className="border rounded px-3 py-2 w-40" />
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="border rounded px-3 py-2 flex-1" />
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="border rounded px-3 py-2 flex-1" />
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="border rounded p-3 space-y-2">
          <input
            placeholder={`Question ${qIdx + 1}`}
            value={q.questionText}
            onChange={(e) => updateQuestion(qIdx, "questionText", e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          {q.options.map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${qIdx}`}
                checked={q.correctOptionIndex === oIdx}
                onChange={() => updateQuestion(qIdx, "correctOptionIndex", oIdx)}
              />
              <input
                placeholder={`Option ${oIdx + 1}`}
                value={opt}
                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                required
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
          <input
            type="number"
            placeholder="Marks"
            value={q.marks}
            onChange={(e) => updateQuestion(qIdx, "marks", Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 text-sm"
          />
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="text-indigo-700 text-sm underline">+ Add another question</button>
      <div>
        <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">Create Quiz</button>
      </div>
    </form>
  );
}

function StudentQuiz({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myAttempt, setMyAttempt] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${quizId}/attempt`).then((res) => {
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(-1));
    });
    api.get(`/quizzes/${quizId}/my-attempt`).then((res) => setMyAttempt(res.data));
  }, [quizId]);

  const submit = async () => {
    const res = await api.post(`/quizzes/${quizId}/attempt`, { answers });
    setResult(res.data);
    setMyAttempt(res.data);
  };

  if (!quiz) return <p className="text-sm text-gray-500 mt-3">Loading quiz...</p>;

  if (myAttempt || result) {
    const r = result || myAttempt;
    return (
      <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded p-3 text-sm">
        You already attempted this quiz. Score: <strong>{r.score} / {r.totalMarks}</strong>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {quiz.questions.map((q, idx) => (
        <div key={idx} className="border rounded p-3">
          <p className="font-medium text-sm mb-2">{idx + 1}. {q.questionText}</p>
          {q.options.map((opt, oIdx) => (
            <label key={oIdx} className="flex items-center gap-2 text-sm mb-1">
              <input
                type="radio"
                name={`q-${idx}`}
                checked={answers[idx] === oIdx}
                onChange={() => {
                  const next = [...answers];
                  next[idx] = oIdx;
                  setAnswers(next);
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submit} className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 text-sm">
        Submit Quiz
      </button>
    </div>
  );
}

function FacultyResults({ quizId }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    api.get(`/quizzes/${quizId}/results`).then((res) => setResults(res.data));
  }, [quizId]);

  return (
    <div className="mt-3 space-y-2">
      {results.map((r) => (
        <div key={r._id} className="flex justify-between border rounded p-2 text-sm">
          <span>{r.student?.name} ({r.student?.rollNumber})</span>
          <span>{r.score} / {r.totalMarks}</span>
        </div>
      ))}
      {results.length === 0 && <p className="text-sm text-gray-500">No attempts yet.</p>}
    </div>
  );
}
