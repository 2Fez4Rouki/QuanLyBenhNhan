import { Storage } from './storage.js';

// 🛠 Hàm phụ trợ lấy ngày chính xác theo giờ Local (tránh lệch UTC)
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const PatientManager = {
  searchKeyword: '',
  editingId: null,
  showTodayOnly: false,
  showAllPatients: false, // Trạng thái hiển thị toàn bộ danh sách

  init() {
    this.render();
    this.checkReminders();
  },

  render() {
    const patients = Storage.getPatients();
    const container = document.getElementById('patient-list');
    const todayContainer = document.getElementById('today-patient-container');
    const todayToggleBtn = document.getElementById('btn-today-toggle');
    const allToggleBtn = document.getElementById('btn-all-toggle');
    if (!container) return;

    const today = getLocalDateString();
    const todayList = patients.filter(p => p.nextDate === today);

    // 1. Render khu vực tái khám hôm nay
    if (todayContainer) {
      if (this.showTodayOnly) {
        if (todayToggleBtn) {
          todayToggleBtn.classList.remove('bg-pink-200', 'text-rose-900');
          todayToggleBtn.classList.add('bg-pink-400', 'text-white', 'ring-2', 'ring-pink-300');
        }
        
        if (todayList.length === 0) {
          todayContainer.innerHTML = `<div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 text-center">Hôm nay (${today}) không có bệnh nhân nào lịch tái khám.</div>`;
        } else {
          todayContainer.innerHTML = `
            <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-sm space-y-2">
              <div class="font-bold text-xs text-amber-900 uppercase flex justify-between items-center">
                <span>🔔 Tái khám hôm nay (${todayList.length}):</span>
                <span onclick="PatientManager.toggleTodayList()" class="cursor-pointer text-gray-500 hover:text-red-500 text-sm">✕ Đóng</span>
              </div>
              <div class="space-y-2">
                ${todayList.map(p => `
                  <div class="bg-white p-2.5 rounded-lg border border-amber-100 flex justify-between items-center text-xs">
                    <div>
                      <span class="font-bold text-blue-900">${p.name}</span> - 📞 ${p.phone}
                    </div>
                    <button onclick="PatientManager.searchAndFocus('${p.phone}')" class="bg-pink-600 text-white px-2 py-1 rounded hover:bg-blue-700">Xem/Sửa</button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        todayContainer.classList.remove('hidden');
      } else {
        if (todayToggleBtn) {
          todayToggleBtn.classList.remove('bg-pink-400', 'text-white', 'ring-2', 'ring-pink-300');
          todayToggleBtn.classList.add('bg-pink-200', 'text-rose-900');
        }
        todayContainer.classList.add('hidden');
      }
    }

    // 2. Cập nhật giao diện nút DS Bệnh Nhân (Đổi sang tông hồng cho đồng bộ)
    if (allToggleBtn) {
      if (this.showAllPatients) {
        // Khi đang bật xem toàn bộ danh sách (Hồng đậm hơn + viền)
        allToggleBtn.classList.remove('bg-pink-200', 'text-rose-900');
        allToggleBtn.classList.add('bg-pink-400', 'text-white', 'ring-2', 'ring-pink-300');
      } else {
        // Khi đang tắt (Hồng nhạt ban đầu)
        allToggleBtn.classList.remove('bg-pink-400', 'text-white', 'ring-2', 'ring-pink-300');
        allToggleBtn.classList.add('bg-pink-200', 'text-rose-900');
      }
    }

    // 3. Render danh sách chính dựa trên từ khóa tìm kiếm hoặc trạng thái bật xem tất cả
    const keyword = this.searchKeyword.toLowerCase().trim();
    
    let targetList = [];
    if (keyword) {
      targetList = patients.filter(p => {
        return (
          (p.name && p.name.toLowerCase().includes(keyword)) ||
          (p.phone && p.phone.toLowerCase().includes(keyword)) ||
          (p.nextDate && p.nextDate.includes(keyword)) ||
          (p.dob && p.dob.includes(keyword))
        );
      });
    } else if (this.showAllPatients) {
      targetList = patients;
    } else {
      container.innerHTML = `<p class="text-gray-400 text-center py-4 text-xs italic">Nhập từ khóa tìm kiếm hoặc bấm nút "DS Bệnh Nhân" ở trên để hiển thị danh sách.</p>`;
      return;
    }

    if (targetList.length === 0) {
      container.innerHTML = `<p class="text-gray-500 text-center py-4">Không tìm thấy bệnh nhân nào phù hợp.</p>`;
      return;
    }

    container.innerHTML = targetList.map(p => {
      if (p.id === this.editingId) {
        return `
          <div class="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200 mb-3 space-y-2">
            <div class="font-bold text-sm text-blue-900 mb-1">Chỉnh sửa thông tin bệnh nhân</div>
            <input type="text" id="edit-name-${p.id}" value="${p.name || ''}" placeholder="Họ tên" class="w-full text-sm border p-2 rounded bg-white focus:outline-none focus:border-blue-500">
            <div class="flex space-x-2">
              <input type="date" id="edit-dob-${p.id}" value="${p.dob || ''}" class="w-1/2 text-sm border p-2 rounded bg-white focus:outline-none focus:border-blue-500">
              <input type="tel" id="edit-phone-${p.id}" value="${p.phone || ''}" placeholder="SĐT" class="w-1/2 text-sm border p-2 rounded bg-white focus:outline-none focus:border-blue-500">
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-xs text-gray-600 font-medium">Tái khám:</label>
              <input type="date" id="edit-next-${p.id}" value="${p.nextDate || ''}" class="flex-1 text-sm border p-2 rounded bg-white focus:outline-none focus:border-blue-500">
            </div>
            <textarea id="edit-note-${p.id}" placeholder="Ghi chú chung..." class="w-full text-sm border p-2 rounded bg-white focus:outline-none focus:border-blue-500">${p.note || ''}</textarea>
            <div class="flex space-x-2 pt-1">
              <button onclick="PatientManager.saveEdit('${p.id}')" class="flex-1 bg-blue-600 text-white text-xs py-2 rounded font-medium hover:bg-blue-700">Lưu thay đổi</button>
              <button onclick="PatientManager.cancelEdit()" class="bg-gray-300 text-gray-700 text-xs px-3 py-2 rounded font-medium hover:bg-gray-400">Hủy</button>
            </div>
          </div>
        `;
      }

      const historyList = (p.history || []).map(h => `
        <div class="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100 mb-1">
          <div>
            <span class="font-semibold text-blue-700">📅 ${h.date}</span>: ${h.note}
          </div>
          <button onclick="PatientManager.deleteHistory('${p.id}', '${h.id}')" class="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
        </div>
      `).join('');

      return `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg text-blue-900">${p.name}</h3>
              <p class="text-sm text-gray-600">📞 ${p.phone} | 📅 NS: ${p.dob}</p>
              <p class="text-sm text-amber-600 font-medium mt-1">🔄 Tái khám: ${p.nextDate || 'Chưa có lịch'}</p>
            </div>
            <div class="flex space-x-2 items-center">
              <button onclick="PatientManager.startEdit('${p.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">Sửa</button>
              <button onclick="PatientManager.deletePatient('${p.id}')" class="text-red-500 hover:text-red-700 text-sm font-semibold">Xóa</button>
            </div>
          </div>
          <div class="mt-2 text-sm bg-gray-50 p-2 rounded text-gray-700">
            <strong>Ghi chú chung:</strong> ${p.note || 'Không có'}
          </div>

          <div class="mt-3 border-t pt-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold text-gray-700 uppercase">Lịch sử khám (${(p.history || []).length}):</span>
            </div>
            <div class="space-y-1 mb-2 max-h-32 overflow-y-auto">
              ${historyList || '<p class="text-xs text-gray-400 italic">Chưa có lịch sử khám nào.</p>'}
            </div>
            
            <div class="bg-blue-50 p-2 rounded-lg space-y-2 mt-2">
              <div class="text-xs font-semibold text-blue-800">Thêm đợt khám / tái khám mới:</div>
              <div class="flex space-x-1">
                <input type="date" id="h-date-${p.id}" value="${getLocalDateString()}" class="text-xs border p-1 rounded w-1/3 bg-white">
                <input type="text" id="h-note-${p.id}" placeholder="Thông tin khám (vd: đã khám, đơn thuốc...)" class="text-xs border p-1 rounded flex-1 bg-white focus:outline-none focus:border-blue-500">
              </div>
              <button onclick="PatientManager.addHistory('${p.id}')" class="w-full bg-pink-200 text-rose-900 text-xs py-1 rounded font-medium hover:bg-blue-700">＋ Thêm Lịch Sử Khám</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleTodayList() {
    this.showTodayOnly = !this.showTodayOnly;
    this.render();
  },

  toggleAllPatientsList() {
    this.showAllPatients = !this.showAllPatients;
    this.render();
  },

  searchAndFocus(keyword) {
    this.searchKeyword = keyword;
    const searchInput = document.getElementById('p-search');
    if (searchInput) searchInput.value = keyword;
    this.showTodayOnly = false;
    this.showAllPatients = false;
    this.render();
  },

  handleSearch(e) {
    this.searchKeyword = e.target.value;
    this.render();
  },

  startEdit(id) {
    this.editingId = id;
    this.render();
  },

  cancelEdit() {
    this.editingId = null;
    this.render();
  },

  saveEdit(id) {
    const name = document.getElementById(`edit-name-${id}`).value;
    const dob = document.getElementById(`edit-dob-${id}`).value;
    const phone = document.getElementById(`edit-phone-${id}`).value;
    const nextDate = document.getElementById(`edit-next-${id}`).value;
    const note = document.getElementById(`edit-note-${id}`).value;

    if (!name || !dob || !phone) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Ngày sinh, SĐT)!');
      return;
    }

    let patients = Storage.getPatients();
    patients = patients.map(p => {
      if (p.id === id) {
        return { ...p, name, dob, phone, nextDate, note };
      }
      return p;
    });

    Storage.savePatients(patients);
    this.editingId = null;
    this.render();
    this.checkReminders();
  },

  addPatient(e) {
    e.preventDefault();
    const patients = Storage.getPatients();
    const newPatient = {
      id: Date.now().toString(),
      name: document.getElementById('p-name').value,
      dob: document.getElementById('p-dob').value,
      phone: document.getElementById('p-phone').value,
      note: document.getElementById('p-note').value,
      nextDate: document.getElementById('p-next-date').value,
      history: []
    };
    patients.push(newPatient);
    Storage.savePatients(patients);
    this.render();
    this.checkReminders();
    e.target.reset();
  },

  deletePatient(id) {
    if (!confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return;
    let patients = Storage.getPatients();
    patients = patients.filter(p => p.id !== id);
    Storage.savePatients(patients);
    this.render();
    this.checkReminders();
  },

  addHistory(patientId) {
    const dateInput = document.getElementById(`h-date-${patientId}`);
    const noteInput = document.getElementById(`h-note-${patientId}`);
    if (!dateInput || !noteInput || !noteInput.value.trim()) {
      alert('Vui lòng nhập nội dung thông tin khám!');
      return;
    }

    let patients = Storage.getPatients();
    patients = patients.map(p => {
      if (p.id === patientId) {
        p.history = p.history || [];
        p.history.push({
          id: Date.now().toString(),
          date: dateInput.value,
          note: noteInput.value.trim()
        });
      }
      return p;
    });

    Storage.savePatients(patients);
    this.render();
    this.checkReminders();
  },

  deleteHistory(patientId, historyId) {
    if (!confirm('Vui lòng xác nhận xóa mục lịch sử khám này?')) return;
    let patients = Storage.getPatients();
    patients = patients.map(p => {
      if (p.id === patientId) {
        p.history = (p.history || []).filter(h => h.id !== historyId);
      }
      return p;
    });

    Storage.savePatients(patients);
    this.render();
    this.checkReminders();
  },

  checkReminders() {
    const patients = Storage.getPatients();
    const today = getLocalDateString();
    const todayList = patients.filter(p => p.nextDate === today);
    const alertBox = document.getElementById('reminder-banner');
    
    if (alertBox) {
      if (todayList.length > 0) {
        alertBox.classList.remove('hidden');
        alertBox.innerHTML = `⚠️ Có <strong>${todayList.length} bệnh nhân</strong> cần tái khám hôm nay (${today}): ${todayList.map(p => p.name).join(', ')}`;
      } else {
        alertBox.classList.add('hidden');
      }
    }
  },

  exportJSON() {
    const data = Storage.getPatients();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_backup_${getLocalDateString()}.json`;
    a.click();
  },

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Storage.savePatients(data);
        this.render();
        this.checkReminders();
        alert('Nhập dữ liệu JSON thành công!');
      } catch (err) {
        alert('Lỗi định dạng file JSON!');
      }
    };
    reader.readAsText(file);
  }
};

// Gắn ra window để các thẻ HTML onclick gọi được
window.PatientManager = PatientManager;
