/**
 * EduManage - Feature Modules
 */
const Modules = {
  dashboard(el) {
    const students = Data.getStudents().filter(s => s.status === 'active');
    const teachers = Data.getTeachers();
    const classes = Data.getClasses();
    const activity = Data.getActivity().slice(0, 8);
    const totalFees = students.reduce((s, st) => s + (st.feeBalance || 0), 0);
    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">👨‍🎓</div><div><div class="stat-value">${students.length}</div><div class="stat-label">Active Students</div></div></div>
        <div class="stat-card"><div class="stat-icon green">👩‍🏫</div><div><div class="stat-value">${teachers.length}</div><div class="stat-label">Teachers</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">📚</div><div><div class="stat-value">${classes.length}</div><div class="stat-label">Classes</div></div></div>
        <div class="stat-card"><div class="stat-icon red">💰</div><div><div class="stat-value">${Utils.currency(totalFees)}</div><div class="stat-label">Outstanding Fees</div></div></div>
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-header"><h3>Enrollment by Grade</h3></div>
          <div class="card-body"><div class="chart-container"><canvas id="chart-enroll"></canvas></div></div></div>
        <div class="card"><div class="card-header"><h3>Recent Activity</h3></div>
          <div class="card-body">${activity.map(a => `<div class="activity-item"><div class="activity-dot"></div><div><div class="activity-text">${a.message}</div><div class="activity-time">${Utils.timeAgo(a.date)}</div></div></div>`).join('') || Utils.emptyState('📋','No activity')}</div></div>
      </div>`;
    const byGrade = {};
    students.forEach(s => { const c = Data.getClassById(s.classId); const k = c ? 'G'+c.level : '?'; byGrade[k]=(byGrade[k]||0)+1; });
    const labels = Object.keys(byGrade).sort();
    if (window.Chart) App.charts.enroll = new Chart(document.getElementById('chart-enroll'), {
      type: 'bar', data: { labels, datasets: [{ label: 'Students', data: labels.map(l => byGrade[l]), backgroundColor: '#2563eb' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  },

  students(el) {
    const list = Auth.scopeStudents().filter(s => s.status !== 'archived');
    const render = (q='') => {
      q = q.toLowerCase();
      const filtered = list.filter(s => !q || s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q));
      const tb = el.querySelector('#stu-tbody');
      if (!tb) return;
      tb.innerHTML = filtered.map(s => `<tr>
        <td>${Utils.avatar(s.name,32)} ${s.name}</td><td>${s.admissionNo}</td><td>${Data.className(s.classId)}</td>
        <td>${s.gender}</td><td>${Utils.badge(s.status,'success')}</td><td>${Utils.currency(s.feeBalance||0)}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="Modules._viewStudent('${s.id}')">View</button></td></tr>`).join('') || '<tr><td colspan=7>No students</td></tr>';
    };
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Students (${list.length})</h3>
      ${Auth.can('manageStudents')?'<button class="btn btn-primary btn-sm" onclick="Modules._addStudent()">+ Add Student</button>':''}
      </div><div class="card-body"><div class="toolbar"><div class="search-input"><input type="text" id="stu-search" placeholder="Search..."></div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Adm No</th><th>Class</th><th>Gender</th><th>Status</th><th>Fee Balance</th><th>Actions</th></tr></thead>
      <tbody id="stu-tbody"></tbody></table></div></div></div>`;
    render();
    document.getElementById('stu-search').addEventListener('input', e => render(e.target.value));
  },

  _addStudent() {
    const classes = Data.getClasses();
    const html = `<div class="form-row"><div class="form-group"><label>Name</label><input class="form-control" id="f-name"></div>
      <div class="form-group"><label>Adm No</label><input class="form-control" id="f-adm" value="GV${1000+Data.getStudents().length+1}"></div></div>
      <div class="form-row"><div class="form-group"><label>Gender</label><select class="form-control" id="f-gender"><option>M</option><option>F</option></select></div>
      <div class="form-group"><label>Class</label><select class="form-control" id="f-class">${classes.map(c=>`<option value="${c.id}">${c.name} ${c.stream}</option>`).join('')}</select></div></div>
      <div class="form-actions"><button class="btn btn-ghost" onclick="window.__currentModal._close()">Cancel</button>
      <button class="btn btn-primary" id="f-save">Save</button></div>`;
    Utils.showModal(html, { title: 'Add Student' });
    setTimeout(() => document.getElementById('f-save')?.addEventListener('click', () => {
      Data.addStudent({ name: document.getElementById('f-name').value, admissionNo: document.getElementById('f-adm').value,
        gender: document.getElementById('f-gender').value, classId: document.getElementById('f-class').value,
        status: 'active', feeBalance: 15000, parentName: '', parentPhone: '', dob: '2015-01-01' });
      Utils.toast('Student added', 'success'); window.__currentModal?._close(); App.navigate('students');
    }), 100);
  },
  _viewStudent(id) {
    const s = Data.getStudentById(id); if (!s) return;
    const marks = Data.getMarks().filter(m => m.studentId === id);
    Utils.showModal(`<div style="display:flex;gap:1rem;align-items:center;margin-bottom:1rem">${Utils.avatar(s.name,56)}
      <div><h3 style="margin:0">${s.name}</h3><p style="color:var(--text-muted)">${s.admissionNo} · ${Data.className(s.classId)}</p></div></div>
      <p><strong>Gender:</strong> ${s.gender} · <strong>Fee:</strong> ${Utils.currency(s.feeBalance||0)}</p>
      <h4>Marks</h4><table class="data-table"><thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
      <tbody>${marks.slice(0,10).map(m=>{const g=Data.gradeFromScore(m.score);return `<tr><td>${Data.getExamById(m.examId)?.name||'—'}</td><td>${Data.getSubjectById(m.subjectId)?.name||'—'}</td><td>${m.score}</td><td>${g.grade}</td></tr>`;}).join('')||'<tr><td colspan=4>No marks</td></tr>'}</tbody></table>`,
      { title: 'Student Profile', size: 'lg' });
  },

  teachers(el) {
    const list = Data.getTeachers();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Teachers (${list.length})</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Emp No</th><th>Subjects</th><th>Classes</th><th>Phone</th></tr></thead>
      <tbody>${list.map(t=>`<tr><td>${Utils.avatar(t.name,32)} ${t.name}</td><td>${t.employeeNo||'—'}</td>
        <td>${(t.subjects||[]).map(id=>Data.getSubjectById(id)?.code||id).join(', ')}</td>
        <td>${(t.classes||[]).map(id=>Data.className(id)).join(', ')}</td><td>${t.phone||'—'}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  classes(el) {
    const list = Data.getClasses(); const students = Data.getStudents();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Classes & Streams</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Class</th><th>Stream</th><th>Level</th><th>Students</th><th>Capacity</th><th>Class Teacher</th></tr></thead>
      <tbody>${list.map(c=>{const cnt=students.filter(s=>s.classId===c.id&&s.status==='active').length;
        const tch=c.classTeacherId?Data.getTeacherById(c.classTeacherId):null;
        return `<tr><td>${c.name}</td><td>${c.stream}</td><td>${c.level}</td><td>${cnt}</td><td>${c.capacity}</td><td>${tch?.name||'—'}</td></tr>`;}).join('')}</tbody></table></div></div></div>`;
  },

  subjects(el) {
    const list = Data.getSubjects();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Subjects</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Name</th></tr></thead>
      <tbody>${list.map(s=>`<tr><td>${s.code}</td><td>${s.name}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  exams(el) {
    const list = Data.getExams();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Examinations</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Term</th><th>Year</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${list.map(e=>`<tr><td>${e.name}</td><td>${e.term}</td><td>${e.year}</td><td>${e.type}</td><td>${Utils.formatDate(e.date)}</td>
        <td>${Utils.badge(e.status,e.status==='completed'?'success':'warning')}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  marks(el) {
    const exams = Data.getExams(), classes = Data.getClasses(), subjects = Data.getSubjects();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Marks Entry</h3></div><div class="card-body">
      <div class="toolbar">
        <select class="form-control" id="mk-exam" style="max-width:200px">${exams.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select>
        <select class="form-control" id="mk-class" style="max-width:180px">${classes.map(c=>`<option value="${c.id}">${c.name} ${c.stream}</option>`).join('')}</select>
        <select class="form-control" id="mk-sub" style="max-width:160px">${subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>
        <button class="btn btn-primary btn-sm" id="mk-load">Load</button>
      </div><div id="mk-area">${Utils.emptyState('✍️','Select exam, class & subject')}</div></div></div>`;
    document.getElementById('mk-load').addEventListener('click', () => {
      const examId = document.getElementById('mk-exam').value, classId = document.getElementById('mk-class').value, subjectId = document.getElementById('mk-sub').value;
      const stus = Data.getStudents().filter(s => s.classId === classId && s.status === 'active');
      const existing = Data.getMarks();
      document.getElementById('mk-area').innerHTML = `<table class="data-table"><thead><tr><th>Student</th><th>Adm No</th><th>Score</th></tr></thead>
        <tbody>${stus.map(s=>{const mk=existing.find(m=>m.studentId===s.id&&m.examId===examId&&m.subjectId===subjectId);
          return `<tr><td>${s.name}</td><td>${s.admissionNo}</td><td><input type="number" class="form-control mk-score" data-sid="${s.id}" min="0" max="100" value="${mk?.score??''}" style="width:100px"></td></tr>`;}).join('')}</tbody></table>
        <div class="form-actions"><button class="btn btn-primary" id="mk-save">Save Marks</button></div>`;
      document.getElementById('mk-save')?.addEventListener('click', () => {
        document.querySelectorAll('.mk-score').forEach(inp => {
          const score = parseInt(inp.value, 10); if (isNaN(score)) return;
          const list = Data.getMarks(); const idx = list.findIndex(m => m.studentId===inp.dataset.sid && m.examId===examId && m.subjectId===subjectId);
          if (idx >= 0) { list[idx].score = score; Data.saveMarks(list); } else Data.addMark({ studentId: inp.dataset.sid, examId, subjectId, score, maxScore: 100 });
        });
        Utils.toast('Marks saved', 'success');
      });
    });
  },

  reports(el) {
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Report Cards</h3></div><div class="card-body">
      <p>Select a completed exam and class from Marks to review scores. Full printable reports available after marks entry.</p>
      <button class="btn btn-primary" onclick="App.navigate('marks')">Go to Marks Entry</button></div></div>`;
  },

  timetable(el) {
    const classes = Data.getClasses(), tt = Data.getTimetable();
    const days = ['Mon','Tue','Wed','Thu','Fri'], periods = [...new Set(tt.map(t=>t.period))];
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Timetable</h3>
      <select class="form-control" id="tt-class" style="max-width:200px">${(tt.length?classes.filter(c=>tt.some(t=>t.classId===c.id)):classes.slice(0,4)).map(c=>`<option value="${c.id}">${c.name} ${c.stream}</option>`).join('')}</select>
      </div><div class="card-body" id="tt-grid"></div></div>`;
    const render = () => {
      const classId = document.getElementById('tt-class').value;
      const rows = periods.map(period => {
        const cells = days.map(day => {
          const slot = tt.find(t => t.classId===classId && t.day===day && t.period===period);
          if (!slot) return '<div class="tt-cell">—</div>';
          return `<div class="tt-cell"><div class="sub">${Data.getSubjectById(slot.subjectId)?.code||''}</div><div class="teacher">${Data.getTeacherById(slot.teacherId)?.name?.split(' ')[0]||''}</div></div>`;
        }).join('');
        return `<div class="tt-time">${period}</div>${cells}`;
      }).join('');
      document.getElementById('tt-grid').innerHTML = `<div class="timetable-grid"><div class="tt-header">Time</div>${days.map(d=>`<div class="tt-header">${d}</div>`).join('')}${rows}</div>`;
    };
    document.getElementById('tt-class').addEventListener('change', render); render();
  },

  attendance(el) {
    const classes = Data.getClasses();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Daily Attendance</h3></div><div class="card-body">
      <div class="toolbar">
        <input type="date" class="form-control" id="att-date" value="${new Date().toISOString().slice(0,10)}" style="max-width:160px">
        <select class="form-control" id="att-class" style="max-width:180px">${classes.map(c=>`<option value="${c.id}">${c.name} ${c.stream}</option>`).join('')}</select>
        <button class="btn btn-primary btn-sm" id="att-load">Load Register</button>
      </div><div id="att-area">${Utils.emptyState('✅','Select date & class')}</div></div></div>`;
    document.getElementById('att-load').addEventListener('click', () => {
      const date = document.getElementById('att-date').value, classId = document.getElementById('att-class').value;
      const stus = Data.getStudents().filter(s => s.classId===classId && s.status==='active');
      const existing = Data.getAttendance().filter(a => a.date===date && a.classId===classId);
      document.getElementById('att-area').innerHTML = `<table class="data-table"><thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead>
        <tbody>${stus.map(s=>{const st=existing.find(a=>a.studentId===s.id)?.status||'present';
          return `<tr><td>${s.name}</td>
            <td><input type="radio" name="att_${s.id}" value="present" ${st==='present'?'checked':''}></td>
            <td><input type="radio" name="att_${s.id}" value="absent" ${st==='absent'?'checked':''}></td>
            <td><input type="radio" name="att_${s.id}" value="late" ${st==='late'?'checked':''}></td></tr>`;}).join('')}</tbody></table>
        <div class="form-actions"><button class="btn btn-primary" id="att-save">Save</button></div>`;
      document.getElementById('att-save')?.addEventListener('click', () => {
        let all = Data.getAttendance().filter(a => !(a.date===date && a.classId===classId));
        Data.saveAttendance(all);
        Data.addAttendance(stus.map(s => ({ studentId: s.id, classId, date, status: document.querySelector(`input[name="att_${s.id}"]:checked`)?.value||'present' })));
        Utils.toast('Attendance saved', 'success');
      });
    });
  },

  fees(el) {
    const students = Auth.can('manageFees') ? Data.getStudents().filter(s=>s.status==='active') : Auth.scopeStudents();
    const payments = Data.getPayments();
    const outstanding = students.filter(s=>(s.feeBalance||0)>0).sort((a,b)=>(b.feeBalance||0)-(a.feeBalance||0));
    el.innerHTML = `<div class="stats-grid">
      <div class="stat-card"><div class="stat-icon red">💰</div><div><div class="stat-value">${Utils.currency(students.reduce((s,st)=>s+(st.feeBalance||0),0))}</div><div class="stat-label">Total Outstanding</div></div></div>
      <div class="stat-card"><div class="stat-icon green">🧾</div><div><div class="stat-value">${payments.length}</div><div class="stat-label">Payments</div></div></div>
      </div>
      <div class="card"><div class="card-header"><h3>Outstanding Balances</h3>
        ${Auth.can('manageFees')?'<button class="btn btn-primary btn-sm" onclick="Modules._recordPayment()">+ Record Payment</button>':''}</div>
        <div class="card-body"><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Class</th><th>Balance</th></tr></thead>
        <tbody>${outstanding.slice(0,30).map(s=>`<tr><td>${s.name}</td><td>${Data.className(s.classId)}</td><td>${Utils.currency(s.feeBalance)}</td></tr>`).join('')||'<tr><td colspan=3>All clear</td></tr>'}</tbody></table></div></div></div>`;
  },
  _recordPayment() {
    const students = Data.getStudents().filter(s=>s.status==='active');
    const html = `<div class="form-group"><label>Student</label><select class="form-control" id="f-stu">${students.map(s=>`<option value="${s.id}">${s.name} – ${Utils.currency(s.feeBalance||0)}</option>`).join('')}</select></div>
      <div class="form-row"><div class="form-group"><label>Amount</label><input type="number" class="form-control" id="f-amt" min="1"></div>
      <div class="form-group"><label>Method</label><select class="form-control" id="f-method"><option>M-Pesa</option><option>Cash</option><option>Bank</option></select></div></div>
      <div class="form-actions"><button class="btn btn-ghost" onclick="window.__currentModal._close()">Cancel</button>
      <button class="btn btn-primary" id="f-save">Record</button></div>`;
    Utils.showModal(html, { title: 'Record Payment' });
    setTimeout(() => document.getElementById('f-save')?.addEventListener('click', () => {
      const amount = parseInt(document.getElementById('f-amt').value, 10); if (!amount) return Utils.toast('Enter amount','error');
      Data.addPayment({ studentId: document.getElementById('f-stu').value, amount, method: document.getElementById('f-method').value,
        date: new Date().toISOString().slice(0,10), receiptNo: 'RCP'+(1000+Math.floor(Math.random()*9000)), description: 'Fee payment' });
      Utils.toast('Payment recorded','success'); window.__currentModal?._close(); App.navigate('fees');
    }), 100);
  },

  assignments(el) {
    const list = Data.getAssignments();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Assignments</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>${list.map(a=>`<tr><td>${a.title}</td><td>${Data.getSubjectById(a.subjectId)?.name||'—'}</td><td>${Data.className(a.classId)}</td>
        <td>${Utils.formatDate(a.dueDate)}</td><td>${Utils.badge(a.status,'info')}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  library(el) {
    const books = Data.getLibrary();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Library</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th></tr></thead>
      <tbody>${books.map(b=>`<tr><td>${b.title}</td><td>${b.author}</td><td>${b.category}</td><td>${b.available}/${b.copies}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  announcements(el) {
    const list = Data.getAnnouncements();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Announcements</h3></div>
      <div class="card-body">${list.map(a=>`<div class="card" style="margin-bottom:1rem;box-shadow:none"><div class="card-body">
        <h3 style="font-size:1rem;margin:0">${a.pinned?'📌 ':''}${a.title}</h3>
        <p style="margin:.75rem 0;color:var(--text-muted)">${a.body}</p>
        <div style="font-size:.8rem;color:var(--text-muted)">By ${a.author} · ${Utils.formatDate(a.date)}</div></div></div>`).join('')||Utils.emptyState('📢','No announcements')}</div></div>`;
  },

  events(el) {
    const list = Data.getEvents();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>School Events</h3></div><div class="card-body">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Location</th></tr></thead>
      <tbody>${list.map(e=>`<tr><td>${e.title}</td><td>${Utils.formatDate(e.date)}</td><td>${e.time}</td><td>${e.location}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  },

  analytics(el) {
    const marks = Data.getMarks(), subjects = Data.getSubjects();
    const bySub = {};
    subjects.forEach(s => { const scores = marks.filter(m=>m.subjectId===s.id).map(m=>m.score); if (scores.length) bySub[s.name]=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length); });
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Average by Subject</h3></div>
      <div class="card-body"><div class="chart-container"><canvas id="chart-analytics"></canvas></div></div></div>`;
    const labels = Object.keys(bySub);
    if (window.Chart) App.charts.analytics = new Chart(document.getElementById('chart-analytics'), {
      type: 'bar', data: { labels, datasets: [{ label: 'Avg %', data: labels.map(l=>bySub[l]), backgroundColor: '#7c3aed' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { max: 100 } } }
    });
  },

  notifications(el) {
    const user = Auth.currentUser();
    const list = Data.getNotifications().filter(n => n.userId === user.id);
    el.innerHTML = `<div class="card"><div class="card-header"><h3>Notifications</h3>
      <button class="btn btn-sm btn-ghost" onclick="Modules._markAllRead()">Mark all read</button></div>
      <div class="card-body">${list.length?list.map(n=>`<div class="activity-item" style="${n.read?'opacity:.6':''}">
        <div class="activity-dot" style="background:${n.read?'var(--border)':'var(--primary)'}"></div>
        <div style="flex:1"><div class="activity-text"><strong>${n.title}</strong> — ${n.body}</div>
        <div class="activity-time">${Utils.timeAgo(n.date)}</div></div></div>`).join(''):Utils.emptyState('🔔','No notifications')}</div></div>`;
  },
  _markRead(id) { Data.markNotificationRead(id); App.updateNotifDot(); App.navigate('notifications'); },
  _markAllRead() { Data.markAllNotificationsRead(Auth.currentUser().id); App.updateNotifDot(); Utils.toast('All read','success'); App.navigate('notifications'); },

  settings(el) {
    const s = Data.getSettings();
    el.innerHTML = `<div class="card"><div class="card-header"><h3>School Settings</h3></div><div class="card-body">
      <div class="form-row"><div class="form-group"><label>School Name</label><input class="form-control" id="s-name" value="${s.schoolName||''}"></div>
        <div class="form-group"><label>Motto</label><input class="form-control" id="s-motto" value="${s.motto||''}"></div></div>
      <div class="form-actions"><button class="btn btn-primary" id="s-save">Save</button>
        <button class="btn btn-danger" id="s-reset">Reset Demo Data</button></div></div></div>`;
    document.getElementById('s-save').addEventListener('click', () => {
      Data.saveSettings({ ...s, schoolName: document.getElementById('s-name').value, motto: document.getElementById('s-motto').value });
      Utils.toast('Saved','success');
    });
    document.getElementById('s-reset').addEventListener('click', async () => {
      if (await Utils.confirm('Wipe all data and re-seed demo?')) { Data.resetDemo(); Utils.toast('Reset','success'); setTimeout(()=>location.reload(),500); }
    });
  },

  parentPortal(el) {
    const user = Auth.currentUser();
    const kids = Data.getStudents().filter(s => (user.studentIds||[]).includes(s.id));
    if (!kids.length) { el.innerHTML = Utils.emptyState('👨‍👩‍👧','No linked children'); return; }
    el.innerHTML = kids.map(s => {
      const marks = Data.getMarks().filter(m=>m.studentId===s.id).slice(0,6);
      return `<div class="card"><div class="card-header"><h3>${s.name} · ${Data.className(s.classId)}</h3>
        <span>Fee: <strong>${Utils.currency(s.feeBalance||0)}</strong></span></div>
        <div class="card-body"><table class="data-table"><thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
        <tbody>${marks.map(m=>{const g=Data.gradeFromScore(m.score);return `<tr><td>${Data.getExamById(m.examId)?.name||'—'}</td><td>${Data.getSubjectById(m.subjectId)?.name||'—'}</td><td>${m.score}</td><td>${g.grade}</td></tr>`;}).join('')||'<tr><td colspan=4>No marks</td></tr>'}</tbody></table></div></div>`;
    }).join('');
  },

  studentPortal(el) {
    const user = Auth.currentUser();
    const s = Data.getStudentById(user.studentId);
    if (!s) { el.innerHTML = Utils.emptyState('🎓','Profile not linked'); return; }
    const marks = Data.getMarks().filter(m=>m.studentId===s.id);
    el.innerHTML = `<div class="stats-grid">
      <div class="stat-card"><div class="stat-icon blue">🎓</div><div><div class="stat-value">${s.name.split(' ')[0]}</div><div class="stat-label">${Data.className(s.classId)}</div></div></div>
      <div class="stat-card"><div class="stat-icon green">📊</div><div><div class="stat-value">${marks.length?Math.round(marks.reduce((a,m)=>a+m.score,0)/marks.length):'—'}%</div><div class="stat-label">Average</div></div></div>
      </div>
      <div class="card"><div class="card-header"><h3>My Results</h3></div><div class="card-body">
        <table class="data-table"><thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
        <tbody>${marks.map(m=>{const g=Data.gradeFromScore(m.score);return `<tr><td>${Data.getExamById(m.examId)?.name||'—'}</td><td>${Data.getSubjectById(m.subjectId)?.name||'—'}</td><td>${m.score}</td><td>${g.grade}</td></tr>`;}).join('')||'<tr><td colspan=4>None</td></tr>'}</tbody></table></div></div>`;
  },

  teacherPortal(el) {
    const user = Auth.currentUser();
    const t = Data.getTeacherById(user.teacherId);
    if (!t) { el.innerHTML = Utils.emptyState('👩‍🏫','Teacher profile not linked'); return; }
    const myClasses = (t.classes||[]).map(id=>Data.getClassById(id)).filter(Boolean);
    const myStudents = Data.getStudents().filter(s=>(t.classes||[]).includes(s.classId)&&s.status==='active');
    el.innerHTML = `<div class="stats-grid">
      <div class="stat-card"><div class="stat-icon purple">📚</div><div><div class="stat-value">${myClasses.length}</div><div class="stat-label">My Classes</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">👨‍🎓</div><div><div class="stat-value">${myStudents.length}</div><div class="stat-label">Students</div></div></div>
      </div>
      <div class="card"><div class="card-header"><h3>Quick Actions</h3></div><div class="card-body" style="display:flex;gap:1rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="App.navigate('attendance')">Take Attendance</button>
        <button class="btn btn-primary" onclick="App.navigate('marks')">Enter Marks</button>
        <button class="btn btn-primary" onclick="App.navigate('assignments')">Assignments</button>
      </div></div>`;
  }
};
