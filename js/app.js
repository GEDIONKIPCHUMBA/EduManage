/**
 * EduManage - Main Application & Router
 */

const App = {
  currentPage: 'dashboard',
  charts: {},

  init() {
    Data.seed();
    this.applyTheme();
    if (!Auth.isLoggedIn()) {
      this.showLogin();
      return;
    }
    this.renderApp();
  },

  applyTheme() {
    const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    Utils.toast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
  },

  showLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-logo">
            <h1>🏫 EduManage</h1>
            <p>School Management & Learning Platform</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" id="login-user" placeholder="Enter username" required autocomplete="username">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" id="login-pass" placeholder="Enter password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Sign In</button>
          </form>
          <div class="demo-accounts">
            <details>
              <summary>Demo Accounts (click to expand)</summary>
              <table>
                <tr><td><strong>admin</strong></td><td>admin123</td><td>Super Admin</td></tr>
                <tr><td><strong>principal</strong></td><td>principal1</td><td>Principal</td></tr>
                <tr><td><strong>teacher1</strong></td><td>teacher123</td><td>Teacher</td></tr>
                <tr><td><strong>classteacher</strong></td><td>class123</td><td>Class Teacher</td></tr>
                <tr><td><strong>accountant</strong></td><td>accounts1</td><td>Accountant</td></tr>
                <tr><td><strong>parent1</strong></td><td>parent123</td><td>Parent</td></tr>
                <tr><td><strong>student1</strong></td><td>student123</td><td>Student</td></tr>
              </table>
            </details>
          </div>
        </div>
      </div>
    `;
    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const u = document.getElementById('login-user').value.trim();
      const p = document.getElementById('login-pass').value;
      const res = Auth.login(u, p);
      if (res.success) {
        Utils.toast(`Welcome, ${res.user.name}!`, 'success');
        this.renderApp();
      } else {
        Utils.toast(res.message, 'error');
      }
    });
  },

  renderApp() {
    const user = Auth.currentUser();
    const nav = this.getNavForRole(user.role);

    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <div class="logo-icon">E</div>
            <h2>EduManage</h2>
          </div>
          <nav class="sidebar-nav" id="sidebar-nav">
            ${nav}
          </nav>
          <div class="sidebar-footer">
            <div class="user-info">
              ${Utils.avatar(user.name, 36)}
              <div class="user-meta">
                <div class="user-name">${user.name}</div>
                <div class="user-role">${user.role.replace('classteacher','Class Teacher')}</div>
              </div>
              <button class="icon-btn" onclick="Auth.logout()" title="Logout">⏻</button>
            </div>
          </div>
        </aside>
        <div class="main-content">
          <header class="topbar">
            <div class="topbar-left">
              <button class="icon-btn menu-toggle" onclick="App.toggleSidebar()">☰</button>
              <div>
                <div class="page-title" id="page-title">Dashboard</div>
                <div class="breadcrumb" id="breadcrumb">Home / Dashboard</div>
              </div>
            </div>
            <div class="topbar-right">
              <button class="icon-btn" onclick="App.toggleTheme()" title="Toggle theme">🌓</button>
              <button class="icon-btn" onclick="App.navigate('notifications')" title="Notifications">
                🔔
                <span class="badge-dot" id="notif-dot" style="display:none"></span>
              </button>
              <button class="icon-btn" onclick="Auth.logout()" title="Logout">⏻</button>
            </div>
          </header>
          <main class="content-area" id="content"></main>
        </div>
      </div>
    `;

    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', () => this.navigate(el.dataset.page));
    });

    this.updateNotifDot();
    this.navigate(this.getDefaultPage(user.role));
  },

  getDefaultPage(role) {
    if (role === 'parent') return 'parent-portal';
    if (role === 'student') return 'student-portal';
    if (['teacher', 'classteacher'].includes(role)) return 'teacher-portal';
    return 'dashboard';
  },

  getNavForRole(role) {
    const items = [];
    const add = (section, list) => {
      items.push(`<div class="nav-section"><div class="nav-section-title">${section}</div>`);
      list.forEach(([page, label, icon]) => {
        items.push(`<div class="nav-item" data-page="${page}"><span class="nav-icon">${icon}</span> ${label}</div>`);
      });
      items.push('</div>');
    };

    if (['superadmin', 'principal', 'deputy', 'accountant', 'librarian'].includes(role) || ['teacher','classteacher'].includes(role)) {
      add('Overview', [['dashboard', 'Dashboard', '📊']]);
    }

    if (Auth.can('manageStudents') || Auth.can('viewDashboard')) {
      const admin = [];
      if (Auth.can('manageStudents')) admin.push(['students', 'Students', '👨‍🎓']);
      if (Auth.can('manageTeachers')) admin.push(['teachers', 'Teachers', '👩‍🏫']);
      if (Auth.can('manageClasses')) admin.push(['classes', 'Classes & Streams', '📚']);
      if (Auth.can('manageSubjects')) admin.push(['subjects', 'Subjects', '📖']);
      if (admin.length) add('Academic', admin);
    }

    if (Auth.can('manageExams') || Auth.can('enterMarks') || Auth.can('generateReports')) {
      add('Examinations', [
        ...(Auth.can('manageExams') ? [['exams', 'Examinations', '📝']] : []),
        ...(Auth.can('enterMarks') ? [['marks', 'Marks Entry', '✍️']] : []),
        ...(Auth.can('generateReports') ? [['reports', 'Report Cards', '📄']] : [])
      ]);
    }

    if (Auth.can('manageAttendance') || Auth.can('manageTimetable')) {
      add('Operations', [
        ...(Auth.can('manageAttendance') ? [['attendance', 'Attendance', '✅']] : []),
        ...(Auth.can('manageTimetable') ? [['timetable', 'Timetable', '🗓️']] : []),
        ...(Auth.can('manageAssignments') ? [['assignments', 'Assignments', '📋']] : [])
      ]);
    }

    if (Auth.can('manageFees') || Auth.can('viewFees')) {
      add('Finance', [['fees', 'Fees & Payments', '💰']]);
    }

    if (Auth.can('manageLibrary')) {
      add('Resources', [['library', 'Library', '📚']]);
    }

    if (Auth.can('manageAnnouncements') || true) {
      add('Communication', [
        ['announcements', 'Announcements', '📢'],
        ['events', 'Events', '🎉'],
        ['notifications', 'Notifications', '🔔']
      ]);
    }

    if (Auth.can('viewAnalytics')) {
      add('Insights', [['analytics', 'Academic Analytics', '📈']]);
    }

    if (Auth.can('viewParentPortal')) {
      add('Portal', [['parent-portal', 'Parent Portal', '👨‍👩‍👧']]);
    }
    if (Auth.can('viewStudentPortal')) {
      add('Portal', [['student-portal', 'Student Portal', '🎓']]);
    }
    if (Auth.can('viewTeacherPortal')) {
      add('Portal', [['teacher-portal', 'Teacher Portal', '👩‍🏫']]);
    }

    if (Auth.can('manageSettings')) {
      add('System', [['settings', 'Settings', '⚙️']]);
    }

    return items.join('');
  },

  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
  },

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    document.getElementById('sidebar')?.classList.remove('open');

    const titles = {
      dashboard: 'Dashboard',
      students: 'Student Management',
      teachers: 'Teacher Management',
      classes: 'Classes & Streams',
      subjects: 'Subjects',
      exams: 'Examination Management',
      marks: 'Marks Entry',
      reports: 'Report Cards',
      timetable: 'Timetable',
      attendance: 'Attendance',
      fees: 'Fees & Payments',
      assignments: 'Assignments & Homework',
      library: 'Library Management',
      announcements: 'Announcements',
      events: 'School Events',
      analytics: 'Academic Analytics',
      notifications: 'Notifications',
      settings: 'Settings',
      'parent-portal': 'Parent Portal',
      'student-portal': 'Student Portal',
      'teacher-portal': 'Teacher Portal'
    };

    document.getElementById('page-title').textContent = titles[page] || page;
    document.getElementById('breadcrumb').textContent = `Home / ${titles[page] || page}`;

    Object.values(this.charts).forEach(c => c?.destroy?.());
    this.charts = {};

    const content = document.getElementById('content');
    content.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted)">Loading…</div>';

    setTimeout(() => {
      try {
        if (typeof Modules === 'undefined') {
          content.innerHTML = '<div class="card"><div class="card-body"><p style="color:var(--danger)">Modules not loaded yet. Please refresh.</p></div></div>';
          return;
        }
        switch (page) {
          case 'dashboard': Modules.dashboard(content); break;
          case 'students': Modules.students(content); break;
          case 'teachers': Modules.teachers(content); break;
          case 'classes': Modules.classes(content); break;
          case 'subjects': Modules.subjects(content); break;
          case 'exams': Modules.exams(content); break;
          case 'marks': Modules.marks(content); break;
          case 'reports': Modules.reports(content); break;
          case 'timetable': Modules.timetable(content); break;
          case 'attendance': Modules.attendance(content); break;
          case 'fees': Modules.fees(content); break;
          case 'assignments': Modules.assignments(content); break;
          case 'library': Modules.library(content); break;
          case 'announcements': Modules.announcements(content); break;
          case 'events': Modules.events(content); break;
          case 'analytics': Modules.analytics(content); break;
          case 'notifications': Modules.notifications(content); break;
          case 'settings': Modules.settings(content); break;
          case 'parent-portal': Modules.parentPortal(content); break;
          case 'student-portal': Modules.studentPortal(content); break;
          case 'teacher-portal': Modules.teacherPortal(content); break;
          default:
            content.innerHTML = Utils.emptyState('🚧', 'Page under construction', 'This module is coming soon.');
        }
      } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="card"><div class="card-body"><p style="color:var(--danger)">Error loading module: ${err.message}</p></div></div>`;
      }
    }, 50);
  },

  updateNotifDot() {
    const user = Auth.currentUser();
    if (!user) return;
    const unread = Data.getNotifications().filter(n => n.userId === user.id && !n.read).length;
    const dot = document.getElementById('notif-dot');
    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
  }
};

// Boot — wait for compressed modules if present
document.addEventListener('DOMContentLoaded', () => {
  const ready = window.__emModulesPromise || Promise.resolve();
  ready.then(() => App.init()).catch(() => App.init());
});
