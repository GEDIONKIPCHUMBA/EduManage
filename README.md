# EduManage — School Management & Learning Platform

A complete, interactive frontend prototype of a School Management System designed for primary and secondary schools (with configurable support for Kenyan CBC and other grading systems).

**Live Demo**: Open `index.html` in a modern browser (or serve via any static host / GitHub Pages).

## Features Implemented

### Core Modules
- **Dashboard** – Real-time statistics, interactive Chart.js charts, recent activity feed, filters
- **Student Management** – Full CRUD, detailed profiles with tabs (academics, attendance, fees, personal), search/filter, promote/transfer/archive
- **Teacher Management** – Profiles, subject/class assignments, workload overview
- **Classes & Streams** – Create/manage classes, streams, assign class teachers
- **Subjects** – Register subjects, assign to classes/teachers
- **Examination & Marks** – Exam setup, bulk marks entry, auto-grade calculation, results processing
- **Report Cards** – Generate individual/class reports, printable A4 layout, teacher/principal comments
- **Timetable** – Configuration, conflict-aware generation (basic), class & teacher views, manual edit
- **Attendance** – Daily class register, present/absent/late, analytics, frequent absentees
- **Fees & Payments** – Fee structures, student statements, payment recording, outstanding balances, receipts
- **Assignments & Homework** – Create, assign, submit, mark, status tracking
- **Library** – Books, borrow/return, overdue tracking
- **Announcements** – Targeted publishing (school/class/role)
- **Discipline Records**
- **School Events**
- **Academic Analytics** – Performance by class/subject, trends, support indicators
- **Notifications** – Role-aware alerts with unread indicators
- **Documents**
- **Settings & User Management**

### Portals
- **Admin / Principal / Deputy** – Full access
- **Teacher / Class Teacher** – Assigned classes, marks, attendance, assignments, comments
- **Parent** – Linked children only (performance, attendance, fees, reports, announcements)
- **Student** – Own profile, timetable, results, homework, progress

### Technical Highlights
- Pure HTML5 + CSS3 + Vanilla JavaScript (modular)
- Tailwind-inspired custom design system + dark mode
- Chart.js for interactive analytics
- LocalStorage for all demo data (persistent across sessions)
- Role-based access control (frontend enforced + data filtering)
- Responsive design (desktop / tablet / mobile)
- Dark / Light mode toggle (persisted)
- Smooth transitions, modals, toasts, skeleton loaders, empty states
- Sample Kenyan-style data (Grade 1–8, streams East/West, KSh fees, etc.)
- Interconnected workflows (marks → results → analytics → report cards; payments → balances → dashboard, etc.)

## Demo Accounts

| Role              | Username          | Password   |
|-------------------|-------------------|------------|
| Super Admin       | admin             | admin123   |
| Principal         | principal         | principal1 |
| Teacher           | teacher1          | teacher123 |
| Class Teacher     | classteacher      | class123   |
| Accountant        | accountant        | accounts1  |
| Parent            | parent1           | parent123  |
| Student           | student1          | student123 |

## How to Run

1. Clone the repository
2. Open `index.html` directly in Chrome/Firefox/Edge **or**
3. Serve with any static server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
4. Login with one of the demo accounts above.

> **Note**: This is a frontend prototype. All data lives in the browser’s LocalStorage. For production use a real backend (Node/Express, Laravel, Django, etc.), database, proper authentication, and server-side permission enforcement.

## Project Structure

```
edumanage/
├── index.html              # Entry point / SPA shell
├── css/
│   └── styles.css          # Custom styles + dark mode
├── js/
│   ├── app.js              # Main application & routing
│   ├── data.js             # Sample data + LocalStorage helpers
│   ├── auth.js             # Authentication & RBAC
│   ├── utils.js            # Helpers, toasts, modals, formatters
│   └── modules.js          # All feature modules
└── README.md
```

## Future / Production Roadmap
- Backend API + database
- Real authentication (JWT / session)
- File uploads (photos, documents, assignment submissions)
- PDF generation (jsPDF / server-side)
- Payment gateway integration
- SMS / Email notifications
- CBC competency tracking enhancements
- Multi-school / multi-tenant support

---

Built as a comprehensive interactive prototype demonstrating a fully interconnected school management platform.
