/**
 * EduManage - Utility helpers
 */

const Utils = {
  // Format currency
  currency(amount) {
    const settings = Data.getSettings();
    const curr = settings.currency || 'KSh';
    return `${curr} ${Number(amount).toLocaleString('en-KE')}`;
  },

  // Format date
  formatDate(iso, opts = {}) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', ...opts });
  },

  formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  // Relative time
  timeAgo(iso) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return this.formatDate(iso);
  },

  // Toast notifications
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container') || createToastContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  // Confirm dialog
  confirm(message, title = 'Confirm') {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-action="cancel">×</button>
          </div>
          <div class="modal-body"><p>${message}</p></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="ok">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('show'), 10);

      overlay.addEventListener('click', e => {
        const action = e.target.dataset.action;
        if (action === 'ok' || action === 'cancel' || e.target === overlay) {
          overlay.classList.remove('show');
          setTimeout(() => overlay.remove(), 200);
          resolve(action === 'ok');
        }
      });
    });
  },

  // Modal helper
  showModal(html, { title = '', size = 'md' } = {}) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal modal-${size}">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-close>×</button>
          </div>
          <div class="modal-body">${html}</div>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('show'), 10);

      const close = (result = null) => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
        resolve(result);
      };

      overlay.querySelector('[data-close]')?.addEventListener('click', () => close());
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

      // Expose close for internal buttons
      overlay._close = close;
      window.__currentModal = overlay;
    });
  },

  // Simple table sorter
  sortTable(table, colIndex, asc = true) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const aText = a.children[colIndex]?.textContent.trim() || '';
      const bText = b.children[colIndex]?.textContent.trim() || '';
      const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum)) return asc ? aNum - bNum : bNum - aNum;
      return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });
    rows.forEach(r => tbody.appendChild(r));
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Generate initials avatar
  avatar(name, size = 40) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#ca8a04','#16a34a','#0891b2'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return `<div class="avatar" style="width:${size}px;height:${size}px;background:${color};font-size:${size*0.4}px">${initials}</div>`;
  },

  // Status badge
  badge(text, type = 'default') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  // Empty state
  emptyState(icon, title, subtitle = '') {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <h3>${title}</h3>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
    `;
  },

  // Skeleton loader
  skeleton(rows = 5) {
    return Array(rows).fill(0).map(() => `
      <div class="skeleton-row">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-lines">
          <div class="skeleton skeleton-line w-60"></div>
          <div class="skeleton skeleton-line w-40"></div>
        </div>
      </div>
    `).join('');
  }
};

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  document.body.appendChild(c);
  return c;
}
