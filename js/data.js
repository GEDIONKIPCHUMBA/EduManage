/**
 * EduManage - Sample Data + LocalStorage helpers
 */

const STORAGE_KEYS = {
  users: 'em_users',
  students: 'em_students',
  teachers: 'em_teachers',
  classes: 'em_classes',
  subjects: 'em_subjects',
  exams: 'em_exams',
  marks: 'em_marks',
  attendance: 'em_attendance',
  fees: 'em_fees',
  payments: 'em_payments',
  assignments: 'em_assignments',
  library: 'em_library',
  borrowings: 'em_borrowings',
  announcements: 'em_announcements',
  events: 'em_events',
  notifications: 'em_notifications',
  activity: 'em_activity',
  settings: 'em_settings',
  timetable: 'em_timetable',
  currentUser: 'em_currentUser',
  theme: 'em_theme',
  seeded: 'em_seeded'
};

const Data = {
  _get(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  _id(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  seed() {
    if (localStorage.getItem(STORAGE_KEYS.seeded) === '1') return;

    this._set(STORAGE_KEYS.settings, {
      schoolName: 'Green Valley Academy',
      motto: 'Excellence Through Learning',
      address: 'Nairobi, Kenya',
      phone: '+254 700 123 456',
      email: 'info@greenvalley.ac.ke',
      currency: 'KSh',
      academicYear: '2026',
      term: 'Term 2',
      gradingSystem: 'CBC'
    });

    const classes = [];
    for (let g = 1; g <= 8; g++) {
      ['East', 'West'].forEach(stream => {
        classes.push({
          id: `cls_g${g}_${stream.toLowerCase()}`,
          name: `Grade ${g}`,
          stream,
          level: g,
          capacity: 40,
          classTeacherId: null
        });
      });
    }
    this._set(STORAGE_KEYS.classes, classes);

    const subjects = [
      { id: 'sub_eng', name: 'English', code: 'ENG' },
      { id: 'sub_math', name: 'Mathematics', code: 'MATH' },
      { id: 'sub_kis', name: 'Kiswahili', code: 'KIS' },
      { id: 'sub_sci', name: 'Science', code: 'SCI' },
      { id: 'sub_sst', name: 'Social Studies', code: 'SST' },
      { id: 'sub_cre', name: 'CRE', code: 'CRE' },
      { id: 'sub_agr', name: 'Agriculture', code: 'AGR' },
      { id: 'sub_art', name: 'Creative Arts', code: 'ART' },
      { id: 'sub_pe', name: 'Physical Education', code: 'PE' },
      { id: 'sub_comp', name: 'Computer Studies', code: 'COMP' }
    ];
    this._set(STORAGE_KEYS.subjects, subjects);

    const teachers = [
      { id: 'tch_1', name: 'Jane Wanjiku', email: 'jane@greenvalley.ac.ke', phone: '0700111222', subjects: ['sub_eng', 'sub_kis'], classes: ['cls_g7_east', 'cls_g8_east'], gender: 'F', employeeNo: 'T001' },
      { id: 'tch_2', name: 'Peter Otieno', email: 'peter@greenvalley.ac.ke', phone: '0700333444', subjects: ['sub_math', 'sub_sci'], classes: ['cls_g6_west', 'cls_g7_west'], gender: 'M', employeeNo: 'T002' },
      { id: 'tch_3', name: 'Mary Akinyi', email: 'mary@greenvalley.ac.ke', phone: '0700555666', subjects: ['sub_sst', 'sub_cre'], classes: ['cls_g5_east', 'cls_g4_east'], gender: 'F', employeeNo: 'T003' },
      { id: 'tch_4', name: 'John Kamau', email: 'john@greenvalley.ac.ke', phone: '0700777888', subjects: ['sub_agr', 'sub_pe'], classes: ['cls_g3_west'], gender: 'M', employeeNo: 'T004' },
      { id: 'tch_5', name: 'Grace Njeri', email: 'grace@greenvalley.ac.ke', phone: '0700999000', subjects: ['sub_art', 'sub_comp'], classes: ['cls_g8_west'], gender: 'F', employeeNo: 'T005' }
    ];
    classes.find(c => c.id === 'cls_g7_east').classTeacherId = 'tch_1';
    classes.find(c => c.id === 'cls_g6_west').classTeacherId = 'tch_2';
    classes.find(c => c.id === 'cls_g5_east').classTeacherId = 'tch_3';
    this._set(STORAGE_KEYS.teachers, teachers);
    this._set(STORAGE_KEYS.classes, classes);

    const firstNames = ['Amani', 'Brian', 'Cynthia', 'David', 'Esther', 'Felix', 'Gloria', 'Hassan', 'Irene', 'James', 'Kevin', 'Linda', 'Moses', 'Nancy', 'Oscar', 'Patience', 'Quincy', 'Ruth', 'Samuel', 'Tracy'];
    const lastNames = ['Ochieng', 'Wanjiru', 'Mutua', 'Kipchoge', 'Auma', 'Njoroge', 'Barasa', 'Chebet', 'Okello', 'Mwangi'];
    const students = [];
    let adm = 1001;
    classes.forEach(cls => {
      const count = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        students.push({
          id: `stu_${adm}`,
          admissionNo: `GV${adm}`,
          name: `${fn} ${ln}`,
          gender: Math.random() > 0.5 ? 'M' : 'F',
          classId: cls.id,
          dob: `201${Math.floor(Math.random() * 8)}-0${1 + Math.floor(Math.random() * 9)}-${10 + Math.floor(Math.random() * 18)}`,
          parentName: `Parent of ${fn}`,
          parentPhone: `07${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          status: 'active',
          feeBalance: Math.floor(Math.random() * 15000)
        });
        adm++;
      }
    });
    this._set(STORAGE_KEYS.students, students);

    const users = [
      { id: 'usr_admin', username: 'admin', password: 'admin123', name: 'System Admin', role: 'superadmin', email: 'admin@greenvalley.ac.ke' },
      { id: 'usr_principal', username: 'principal', password: 'principal1', name: 'Dr. Alice Mwangi', role: 'principal', email: 'principal@greenvalley.ac.ke' },
      { id: 'usr_teacher1', username: 'teacher1', password: 'teacher123', name: 'Jane Wanjiku', role: 'teacher', email: 'jane@greenvalley.ac.ke', teacherId: 'tch_1' },
      { id: 'usr_ct', username: 'classteacher', password: 'class123', name: 'Peter Otieno', role: 'classteacher', email: 'peter@greenvalley.ac.ke', teacherId: 'tch_2' },
      { id: 'usr_acc', username: 'accountant', password: 'accounts1', name: 'Susan Atieno', role: 'accountant', email: 'accounts@greenvalley.ac.ke' },
      { id: 'usr_parent1', username: 'parent1', password: 'parent123', name: 'James Omondi', role: 'parent', email: 'parent1@email.com', studentIds: students.slice(0, 2).map(s => s.id) },
      { id: 'usr_student1', username: 'student1', password: 'student123', name: students[0].name, role: 'student', email: 'student1@email.com', studentId: students[0].id }
    ];
    this._set(STORAGE_KEYS.users, users);

    const exams = [
      { id: 'ex_mid', name: 'Mid-Term Exam', term: 'Term 2', year: '2026', type: 'midterm', status: 'completed', date: '2026-06-15' },
      { id: 'ex_end', name: 'End of Term Exam', term: 'Term 2', year: '2026', type: 'endterm', status: 'ongoing', date: '2026-07-20' },
      { id: 'ex_cat1', name: 'CAT 1', term: 'Term 2', year: '2026', type: 'cat', status: 'completed', date: '2026-05-10' }
    ];
    this._set(STORAGE_KEYS.exams, exams);

    const marks = [];
    const sampleStudents = students.slice(0, 30);
    sampleStudents.forEach(stu => {
      subjects.slice(0, 6).forEach(sub => {
        marks.push({
          id: this._id('mk'),
          studentId: stu.id,
          examId: 'ex_mid',
          subjectId: sub.id,
          score: 40 + Math.floor(Math.random() * 55),
          maxScore: 100
        });
      });
    });
    this._set(STORAGE_KEYS.marks, marks);

    const attendance = [];
    const today = new Date();
    for (let d = 0; d < 5; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const dateStr = date.toISOString().slice(0, 10);
      sampleStudents.slice(0, 20).forEach(stu => {
        const r = Math.random();
        attendance.push({
          id: this._id('att'),
          studentId: stu.id,
          classId: stu.classId,
          date: dateStr,
          status: r > 0.9 ? 'absent' : r > 0.85 ? 'late' : 'present'
        });
      });
    }
    this._set(STORAGE_KEYS.attendance, attendance);

    const fees = classes.map(c => ({
      id: `fee_${c.id}`,
      classId: c.id,
      tuition: 15000 + c.level * 500,
      activity: 2000,
      lunch: 3000,
      transport: 4000
    }));
    this._set(STORAGE_KEYS.fees, fees);

    const payments = [];
    sampleStudents.forEach(stu => {
      if (Math.random() > 0.3) {
        payments.push({
          id: this._id('pay'),
          studentId: stu.id,
          amount: 5000 + Math.floor(Math.random() * 10000),
          method: ['M-Pesa', 'Cash', 'Bank'][Math.floor(Math.random() * 3)],
          date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().slice(0, 10),
          receiptNo: `RCP${1000 + Math.floor(Math.random() * 9000)}`,
          description: 'Tuition fee payment'
        });
      }
    });
    this._set(STORAGE_KEYS.payments, payments);

    const assignments = [
      { id: 'asg_1', title: 'English Composition', subjectId: 'sub_eng', classId: 'cls_g7_east', teacherId: 'tch_1', dueDate: '2026-07-15', status: 'open', description: 'Write a 300-word essay on environmental conservation.' },
      { id: 'asg_2', title: 'Math Worksheet – Fractions', subjectId: 'sub_math', classId: 'cls_g6_west', teacherId: 'tch_2', dueDate: '2026-07-12', status: 'open', description: 'Complete exercises 1–20.' },
      { id: 'asg_3', title: 'Science Project', subjectId: 'sub_sci', classId: 'cls_g7_west', teacherId: 'tch_2', dueDate: '2026-07-20', status: 'open', description: 'Prepare a simple water filtration model.' }
    ];
    this._set(STORAGE_KEYS.assignments, assignments);

    const library = [
      { id: 'bk_1', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', copies: 5, available: 3, category: 'Literature' },
      { id: 'bk_2', title: 'Primary Mathematics Grade 6', author: 'KLB', isbn: '978-9966-01-234', copies: 20, available: 15, category: 'Textbook' },
      { id: 'bk_3', title: 'The River and the Source', author: 'Margaret Ogola', isbn: '978-9966-25-123', copies: 8, available: 6, category: 'Literature' },
      { id: 'bk_4', title: 'Science Today Grade 7', author: 'Longhorn', isbn: '978-9966-49-001', copies: 15, available: 12, category: 'Textbook' },
      { id: 'bk_5', title: 'Kiswahili Sanifu', author: 'Jomo Kenyatta Foundation', isbn: '978-9966-22-100', copies: 10, available: 8, category: 'Textbook' }
    ];
    this._set(STORAGE_KEYS.library, library);
    this._set(STORAGE_KEYS.borrowings, [
      { id: 'br_1', bookId: 'bk_1', studentId: students[0].id, borrowDate: '2026-06-20', dueDate: '2026-07-04', returnDate: null, status: 'borrowed' },
      { id: 'br_2', bookId: 'bk_3', studentId: students[1].id, borrowDate: '2026-06-15', dueDate: '2026-06-29', returnDate: null, status: 'overdue' }
    ]);

    this._set(STORAGE_KEYS.announcements, [
      { id: 'ann_1', title: 'End of Term Exams Schedule', body: 'End of Term 2 examinations will commence on 20th July 2026. Please ensure all fees are cleared.', target: 'all', author: 'Dr. Alice Mwangi', date: '2026-07-01', pinned: true },
      { id: 'ann_2', title: 'Parents Meeting', body: 'A parents meeting will be held on 18th July at 9:00 AM in the school hall.', target: 'parents', author: 'Principal', date: '2026-07-05', pinned: false },
      { id: 'ann_3', title: 'Sports Day', body: 'Annual Sports Day is scheduled for 25th July. All students to wear PE kits.', target: 'all', author: 'Games Teacher', date: '2026-07-08', pinned: false }
    ]);

    this._set(STORAGE_KEYS.events, [
      { id: 'ev_1', title: 'Sports Day', date: '2026-07-25', time: '08:00', location: 'School Field', description: 'Annual inter-house sports competition.' },
      { id: 'ev_2', title: 'Parents Meeting', date: '2026-07-18', time: '09:00', location: 'School Hall', description: 'Term 2 academic review with parents.' },
      { id: 'ev_3', title: 'Prize Giving Day', date: '2026-08-05', time: '10:00', location: 'School Hall', description: 'Recognition of academic and co-curricular excellence.' }
    ]);

    this._set(STORAGE_KEYS.notifications, [
      { id: 'nt_1', userId: 'usr_admin', title: 'New student registered', body: 'A new student was added to Grade 7 East.', read: false, date: new Date().toISOString() },
      { id: 'nt_2', userId: 'usr_principal', title: 'Fee collection update', body: "Today's collections total KSh 45,000.", read: false, date: new Date().toISOString() },
      { id: 'nt_3', userId: 'usr_teacher1', title: 'Assignment due soon', body: 'English Composition is due in 3 days.', read: true, date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'nt_4', userId: 'usr_parent1', title: 'Fee reminder', body: 'Outstanding balance for your child.', read: false, date: new Date().toISOString() },
      { id: 'nt_5', userId: 'usr_student1', title: 'New assignment', body: 'English Composition has been posted.', read: false, date: new Date().toISOString() }
    ]);

    this._set(STORAGE_KEYS.activity, [
      { id: 'act_1', type: 'system', message: 'System seeded with demo data', user: 'system', date: new Date().toISOString() },
      { id: 'act_2', type: 'exam', message: 'Mid-Term results published', user: 'admin', date: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 'act_3', type: 'fee', message: 'Payment received – RCP4521', user: 'accountant', date: new Date(Date.now() - 3600000).toISOString() }
    ]);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const periods = ['08:00-08:40', '08:40-09:20', '09:40-10:20', '10:20-11:00', '11:20-12:00', '12:00-12:40'];
    const timetable = [];
    ['cls_g7_east', 'cls_g6_west'].forEach(classId => {
      days.forEach(day => {
        periods.forEach((period, pi) => {
          const sub = subjects[pi % subjects.length];
          const tch = teachers[pi % teachers.length];
          timetable.push({ id: this._id('tt'), classId, day, period, subjectId: sub.id, teacherId: tch.id });
        });
      });
    });
    this._set(STORAGE_KEYS.timetable, timetable);

    localStorage.setItem(STORAGE_KEYS.seeded, '1');
  },

  getSettings() { return this._get(STORAGE_KEYS.settings, {}); },
  getUsers() { return this._get(STORAGE_KEYS.users); },
  getStudents() { return this._get(STORAGE_KEYS.students); },
  getTeachers() { return this._get(STORAGE_KEYS.teachers); },
  getClasses() { return this._get(STORAGE_KEYS.classes); },
  getSubjects() { return this._get(STORAGE_KEYS.subjects); },
  getExams() { return this._get(STORAGE_KEYS.exams); },
  getMarks() { return this._get(STORAGE_KEYS.marks); },
  getAttendance() { return this._get(STORAGE_KEYS.attendance); },
  getFees() { return this._get(STORAGE_KEYS.fees); },
  getPayments() { return this._get(STORAGE_KEYS.payments); },
  getAssignments() { return this._get(STORAGE_KEYS.assignments); },
  getLibrary() { return this._get(STORAGE_KEYS.library); },
  getBorrowings() { return this._get(STORAGE_KEYS.borrowings); },
  getAnnouncements() { return this._get(STORAGE_KEYS.announcements); },
  getEvents() { return this._get(STORAGE_KEYS.events); },
  getNotifications() { return this._get(STORAGE_KEYS.notifications); },
  getActivity() { return this._get(STORAGE_KEYS.activity); },
  getTimetable() { return this._get(STORAGE_KEYS.timetable); },

  getStudentById(id) { return this.getStudents().find(s => s.id === id); },
  getTeacherById(id) { return this.getTeachers().find(t => t.id === id); },
  getClassById(id) { return this.getClasses().find(c => c.id === id); },
  getSubjectById(id) { return this.getSubjects().find(s => s.id === id); },
  getExamById(id) { return this.getExams().find(e => e.id === id); },

  className(classId) {
    const c = this.getClassById(classId);
    return c ? `${c.name} ${c.stream}` : '—';
  },

  saveStudents(list) { this._set(STORAGE_KEYS.students, list); },
  saveTeachers(list) { this._set(STORAGE_KEYS.teachers, list); },
  saveClasses(list) { this._set(STORAGE_KEYS.classes, list); },
  saveSubjects(list) { this._set(STORAGE_KEYS.subjects, list); },
  saveExams(list) { this._set(STORAGE_KEYS.exams, list); },
  saveMarks(list) { this._set(STORAGE_KEYS.marks, list); },
  saveAttendance(list) { this._set(STORAGE_KEYS.attendance, list); },
  savePayments(list) { this._set(STORAGE_KEYS.payments, list); },
  saveAssignments(list) { this._set(STORAGE_KEYS.assignments, list); },
  saveLibrary(list) { this._set(STORAGE_KEYS.library, list); },
  saveBorrowings(list) { this._set(STORAGE_KEYS.borrowings, list); },
  saveAnnouncements(list) { this._set(STORAGE_KEYS.announcements, list); },
  saveEvents(list) { this._set(STORAGE_KEYS.events, list); },
  saveNotifications(list) { this._set(STORAGE_KEYS.notifications, list); },
  saveSettings(obj) { this._set(STORAGE_KEYS.settings, obj); },
  saveTimetable(list) { this._set(STORAGE_KEYS.timetable, list); },

  addStudent(stu) {
    const list = this.getStudents();
    stu.id = stu.id || this._id('stu');
    list.push(stu);
    this.saveStudents(list);
    this.addActivity('student', `Student ${stu.name} registered`, Auth.currentUser()?.username);
    return stu;
  },

  updateStudent(id, data) {
    const list = this.getStudents();
    const i = list.findIndex(s => s.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...data }; this.saveStudents(list); }
  },

  deleteStudent(id) {
    this.saveStudents(this.getStudents().filter(s => s.id !== id));
  },

  addTeacher(tch) {
    const list = this.getTeachers();
    tch.id = tch.id || this._id('tch');
    list.push(tch);
    this.saveTeachers(list);
    this.addActivity('teacher', `Teacher ${tch.name} added`, Auth.currentUser()?.username);
    return tch;
  },

  updateTeacher(id, data) {
    const list = this.getTeachers();
    const i = list.findIndex(t => t.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...data }; this.saveTeachers(list); }
  },

  deleteTeacher(id) {
    this.saveTeachers(this.getTeachers().filter(t => t.id !== id));
  },

  addMark(mk) {
    const list = this.getMarks();
    mk.id = mk.id || this._id('mk');
    list.push(mk);
    this.saveMarks(list);
  },

  addPayment(pay) {
    const list = this.getPayments();
    pay.id = pay.id || this._id('pay');
    list.push(pay);
    this.savePayments(list);
    const stu = this.getStudentById(pay.studentId);
    if (stu) {
      this.updateStudent(stu.id, { feeBalance: Math.max(0, (stu.feeBalance || 0) - pay.amount) });
    }
    this.addActivity('fee', `Payment ${pay.receiptNo} – ${Utils.currency(pay.amount)}`, Auth.currentUser()?.username);
  },

  addAttendance(records) {
    const list = this.getAttendance();
    records.forEach(r => { r.id = r.id || this._id('att'); list.push(r); });
    this.saveAttendance(list);
  },

  addAnnouncement(ann) {
    const list = this.getAnnouncements();
    ann.id = ann.id || this._id('ann');
    list.unshift(ann);
    this.saveAnnouncements(list);
  },

  addActivity(type, message, user = 'system') {
    const list = this.getActivity();
    list.unshift({ id: this._id('act'), type, message, user, date: new Date().toISOString() });
    if (list.length > 100) list.length = 100;
    this._set(STORAGE_KEYS.activity, list);
  },

  markNotificationRead(id) {
    const list = this.getNotifications();
    const n = list.find(x => x.id === id);
    if (n) { n.read = true; this.saveNotifications(list); }
  },

  markAllNotificationsRead(userId) {
    const list = this.getNotifications();
    list.forEach(n => { if (n.userId === userId) n.read = true; });
    this.saveNotifications(list);
  },

  gradeFromScore(score) {
    if (score >= 80) return { grade: 'A', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B', remark: 'Good' };
    if (score >= 60) return { grade: 'C', remark: 'Satisfactory' };
    if (score >= 50) return { grade: 'D', remark: 'Needs Improvement' };
    return { grade: 'E', remark: 'Below Expectation' };
  },

  resetDemo() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    this.seed();
  }
};
