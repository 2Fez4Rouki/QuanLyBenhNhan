import { Storage } from './storage.js';

function getLocalDateString(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateVN(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

function getStatusBadge(status) {
  const normalized = status || 'Không rõ';
  const styleMap = {
    'Đang điều trị': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Kết thúc điều trị': 'bg-blue-100 text-blue-800 border-blue-300',
    'Đã mất': 'bg-gray-700 text-white border-gray-800',
    'Bỏ điều trị': 'bg-red-100 text-red-800 border-red-300',
    'Không rõ': 'bg-gray-100 text-gray-600 border-gray-300'
  };
  const cls = styleMap[normalized] || styleMap['Không rõ'];
  return `<span class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}">${normalized}</span>`;
}

const CalendarManager = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDate: getLocalDateString(),

  init() {
    this.render();
  },

  prevMonth() {
    this.currentMonth -= 1;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    }
    this.render();
  },

  nextMonth() {
    this.currentMonth += 1;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    }
    this.render();
  },

  goToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDate = getLocalDateString(now);
    this.render();
  },

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.render();
  },

  openPatient(keyword) {
    if (typeof window.jumpToPatient === 'function') {
      window.jumpToPatient(keyword);
    } else if (window.PatientManager && typeof window.PatientManager.searchAndFocus === 'function') {
      if (typeof window.switchTab === 'function') window.switchTab('tab-patients');
      window.PatientManager.searchAndFocus(keyword);
    }
  },

  render() {
    const titleEl = document.getElementById('cal-month-title');
    const gridEl = document.getElementById('cal-grid');
    const detailEl = document.getElementById('cal-selected-container');
    if (!titleEl || !gridEl || !detailEl) return;

    const patients = Storage.getPatients() || [];
    const todayStr = getLocalDateString();

    const countByDate = {};
    for (const p of patients) {
      if (p && p.nextDate) {
        countByDate[p.nextDate] = (countByDate[p.nextDate] || 0) + 1;
      }
    }

    titleEl.textContent = `Tháng ${this.currentMonth + 1} / ${this.currentYear}`;

    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(`<div class="h-12 rounded-lg bg-gray-50/60"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(this.currentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${this.currentYear}-${mm}-${dd}`;
      const count = countByDate[dateStr] || 0;

      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.selectedDate;

      let cellClasses = 'relative h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition select-none ';
      if (isSelected) {
        cellClasses += 'bg-pink-200 border-rose-500 text-rose-950 font-bold ring-2 ring-pink-300';
      } else if (isToday) {
        cellClasses += 'bg-amber-50 border-amber-400 text-amber-900 font-bold hover:bg-amber-100';
      } else {
        cellClasses += 'bg-white border-gray-100 text-gray-700 hover:bg-pink-50';
      }

      const badgeHtml = count > 0
        ? `<span class="mt-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">${count}</span>`
        : `<span class="mt-0.5 h-[18px] flex items-center justify-center text-[10px] text-gray-300">·</span>`;

      cells.push(`
        <div onclick="CalendarManager.selectDate('${dateStr}')" class="${cellClasses}">
          <span class="text-xs leading-tight">${day}</span>
          ${badgeHtml}
        </div>
      `);
    }

    gridEl.innerHTML = cells.join('');

    const matchedPatients = patients.filter(p => p.nextDate === this.selectedDate);
    const isTodaySelected = this.selectedDate === todayStr;

    if (matchedPatients.length === 0) {
      detailEl.innerHTML = `
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div class="text-xs font-bold text-gray-700 mb-1">
            📅 Ngày ${formatDateVN(this.selectedDate)} ${isTodaySelected ? '(Hôm nay)' : ''}
          </div>
          <p class="text-xs text-gray-400 italic">Không có bệnh nhân nào có lịch tái khám vào ngày này.</p>
        </div>
      `;
      return;
    }

    detailEl.innerHTML = `
      <div class="bg-white rounded-xl border border-pink-200 p-3.5 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between border-b border-pink-100 pb-2">
          <span class="text-xs font-bold text-rose-900">
            📅 Tái khám ngày ${formatDateVN(this.selectedDate)} ${isTodaySelected ? '(Hôm nay)' : ''}
          </span>
          <span class="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            ${matchedPatients.length} bệnh nhân
          </span>
        </div>
        <div class="space-y-2">
          ${matchedPatients.map(p => `
            <div class="p-2.5 rounded-lg bg-pink-50/60 border border-pink-100 flex justify-between items-start gap-2">
              <div class="text-xs space-y-1">
                <div class="flex items-center flex-wrap gap-1.5">
                  <span class="font-bold text-blue-900 text-sm">${p.name || ''}</span>
                  ${getStatusBadge(p.status)}
                </div>
                <div class="text-gray-600">📞 ${p.phone || ''} ${p.dob ? `| Năm sinh: ${p.dob}` : ''}</div>
                ${p.note ? `<div class="text-gray-700 bg-white/80 px-2 py-1 rounded mt-1 border border-pink-100">📝 ${p.note}</div>` : ''}
              </div>
              <button onclick="CalendarManager.openPatient('${(p.phone || p.name || '').replace(/'/g, "\'")}')" class="shrink-0 bg-pink-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium hover:bg-pink-700 transition">
                Xem/Sửa
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};

window.CalendarManager = CalendarManager;
