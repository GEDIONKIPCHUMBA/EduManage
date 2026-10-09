/**
 * EduManage - Authentication & Role-Based Access Control
 */

const Auth = {
  login(username, password) {
    const users = Data.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, message: 'Invalid username or password' };

    const session = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      teacherId: user.teacherId || null,
      studentId: user.studentId || null,
      studentIds: user.studentIds || [],
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(session));
    Data.addActivity('login', `${user.name} logged in`, user.username);
    return { success: true, user: session };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    window.location.reload();
  },

  currentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.currentUser();
  },

  hasRole(...roles) {
    const u = this.currentUser();
    return u && roles.includes(u.role);
  },

  // Permission matrix (frontend)
  can(action) {
    const u = this.currentUser();
    if (!u) return false;
    const role = u.role;

    const permissions = {
      viewDashboard: ['superadmin', 'principal', 'deputy', 'teacher', 'classteacher', 'accountant', 'librarian'],
      manageStudents: ['superadmin', 'principal', 'deputy'],
      manageTeachers: ['superadmin', 'principal'],
      manageClasses: ['superadmin', 'principal', 'deputy'],
      manageSubjects: ['superadmin', 'principal'],
      manageExams: ['superadmin', 'principal', 'deputy', 'teacher', 'classteacher'],
      enterMarks: ['superadmin', 'principal', 'teacher', 'classteacher'],
      generateReports: ['superadmin', 'principal', 'deputy', 'classteacher', 'teacher'],
      manageTimetable: ['superadmin', 'principal', 'deputy'],
      manageAttendance: ['superadmin', 'principal', 'teacher', 'classteacher'],
      manageFees: ['superadmin', 'principal', 'accountant'],
      viewFees: ['superadmin', 'principal', 'accountant', 'parent'],
      manageAssignments: ['superadmin', 'principal', 'teacher', 'classteacher'],
      manageLibrary: ['superadmin', 'principal', 'librarian'],
      manageAnnouncements: ['superadmin', 'principal', 'deputy', 'teacher'],
      viewAnalytics: ['superadmin', 'principal', 'deputy'],
      manageSettings: ['superadmin', 'principal'],
      viewParentPortal: ['parent'],
      viewStudentPortal: ['student'],
      viewTeacherPortal: ['teacher', 'classteacher']
    };

    const allowed = permissions[action] || [];
    return allowed.includes(role);
  },

  // Filter data based on role
  scopeStudents() {
    const u = this.currentUser();
    const all = Data.getStudents();
    if (['superadmin', 'principal', 'deputy', 'accountant', 'librarian'].includes(u.role)) return all;
    if (u.role === 'parent') return all.filter(s => (u.studentIds || []).includes(s.id));
    if (u.role === 'student') return all.filter(s => s.id === u.studentId);
    if (['teacher', 'classteacher'].includes(u.role)) {
      const teacher = Data.getTeacherById(u.teacherId);
      if (!teacher) return [];
      return all.filter(s => teacher.classes.includes(s.classId));
    }
    return [];
  }
};
