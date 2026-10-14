# EduLearn LMS — MERN Stack Educational Platform

A full-stack Learning Management System built with **MongoDB, Express, React, Node.js** covering:

- 🔐 Auth (student / faculty roles, JWT)
- 📚 Course management + enrollment + material uploads
- 📝 Assignments with file submission and grading
- 🧠 Quizzes with auto-grading (MCQ)
- 🗓️ Attendance tracking with per-student percentage
- 💬 Discussion forums (posts + comments) per course
- 📊 Student performance analytics (per-student and course-wide)

This has been checked end-to-end: all backend modules load without error, and
`npx vite build` succeeds on the frontend with zero errors.

---

## 1. Prerequisites

Install these on your machine before starting:

- **Node.js** v18+ and npm — https://nodejs.org
- **MongoDB** — either:
  - Local install: https://www.mongodb.com/docs/manual/installation/, or
  - Free cloud cluster: https://www.mongodb.com/cloud/atlas (recommended if you don't want to install DB locally)

Verify:
```bash
node -v
npm -v
```

---

## 2. Project Structure

```
lms/
├── backend/          Express + MongoDB API
│   ├── config/db.js
│   ├── models/       User, Course, Assignment, Submission, Quiz, QuizAttempt, Attendance, ForumPost
│   ├── middleware/   auth.js (JWT), upload.js (multer)
│   ├── controllers/  business logic for every module
│   ├── routes/       REST endpoints
│   ├── uploads/       uploaded files served statically
│   └── server.js
└── frontend/         React (Vite) + Tailwind CSS
    └── src/
        ├── api/axios.js         axios instance with JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/          Navbar, PrivateRoute, and one Tab component per module
        └── pages/               Login, Register, Dashboard, Courses, CourseDetail
```

---

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lms_db      # or your Atlas connection string
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Start MongoDB locally (skip if using Atlas):
```bash
mongod --dbpath /path/to/your/db-folder
```

Run the API:
```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

You should see:
```
MongoDB connected: ...
Server running on port 5000
```

Test it's alive: open `http://localhost:5000` → should show "LMS API is running".

---

## 4. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point to your backend:
```
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:
```bash
npm run dev
```

Open the printed URL, typically **http://localhost:5173**.

---

## 5. Using the App

1. **Register** two accounts to try both roles:
   - One with role **Faculty**
   - One with role **Student**
2. As **Faculty**: go to *Courses* → create a course (needs a unique course code) → open it → upload materials, create assignments, create quizzes, mark attendance (once students enroll), view analytics.
3. As **Student**: go to *Courses* → *All Available Courses* → click **Enroll** on the faculty's course → open it → submit assignments, attempt quizzes, view your attendance %, post in the forum, check your analytics.

Everything (auth, courses, assignments, quizzes, attendance, forum, analytics) is fully wired to real API endpoints — no mock data.

---

## 6. API Reference (quick overview)

| Module | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | `/register`, `/login`, `/me` |
| Courses | `/api/courses` | create (faculty), list, enroll (student), materials upload |
| Assignments | `/api/assignments` | create, submit (multipart), grade, per-student submission |
| Quizzes | `/api/quizzes` | create (with MCQ questions), attempt, auto-graded results |
| Attendance | `/api/attendance` | mark per-session, per-course history, per-student % |
| Forum | `/api/forum` | posts + nested comments per course |
| Analytics | `/api/analytics` | per-student performance, course-wide table for faculty |

All routes except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <jwt token>
```

---

## 7. Next Steps / Extending It

- Add password reset / email verification
- Add real-time notifications (Socket.io) for forum replies and grading
- Add pagination on forum posts / submissions lists for large classes
- Add a rich-text editor for assignment descriptions and forum posts
- Deploy: backend to Render/Railway, frontend to Vercel/Netlify, DB to MongoDB Atlas
- Add role: **admin** (already scaffolded in the User model / route guards) for managing all users and courses centrally

---

## 8. Troubleshooting

- **"MongoDB connected" never prints / connection error** → check `MONGO_URI` in `backend/.env`, and that `mongod` is actually running (or your Atlas IP allowlist includes your IP).
- **CORS errors in browser console** → make sure `CLIENT_URL` in backend `.env` matches the URL the frontend actually runs on.
- **401 Unauthorized on every request** → your token expired or wasn't saved; log out and log back in.
- **File upload fails** → `backend/uploads` folder must exist and be writable (it's created automatically by this project).
