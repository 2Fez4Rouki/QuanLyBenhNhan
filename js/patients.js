const PatientManager = {
  searchKeyword: '',

  init() {
    this.render();
    this.checkReminders();
  },

  render() {
    const patients = Storage.getPatients();
    const container = document.getElementById('patient-list');
    if (!container) return;

    const keyword = this.searchKeyword.toLowerCase().trim();

    // Khi chưa nhập từ khóa tìm kiếm -> Không hiển thị danh sách để làm gọn giao diện
    if (!keyword) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <p class="text-2xl mb-1">🔍</p>
          <p class="text-sm">Nhập tên, SĐT hoặc ngày tái khám để tìm bệnh nhân</p>
        </div>
      `;
      return;
    }

    // Lọc bệnh nhân theo từ khóa
    const filtered = patients.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(keyword)) ||
        (p.phone && p.phone.toLowerCase().includes(keyword)) ||
        (p.nextDate && p.nextDate.includes(keyword)) ||
        (p.dob && p.dob.includes(keyword))
      );
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-gray-500 text-center py-4">Không tìm thấy bệnh nhân nào phù hợp với "${this.searchKeyword}".</p>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
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
            <button onclick="PatientManager.deletePatient('${p.id}')" class="text-red-500 hover:text-red-700 text-sm font-semibold">Xóa</button>
          </div>
          <div class="mt-2 text-sm bg-gray-50 p-2 rounded text-gray-700">
            <strong>Ghi chú chung:</strong> ${p.note || 'Không có'}
          </div>

          <!-- History / Sub-elements section -->
          <div class="mt-3 border-t pt-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold text-gray-700 uppercase">Lịch sử khám (${(p.history || []).length}):</span>
            </div>
            <div class="space-y-1 mb-2 max-h-32 overflow-y-auto">
              ${historyList || '<p class="text-xs text-gray-400 italic">Chưa có lịch sử khám nào.</p>'}
            </div>
            
            <!-- Add history form inline -->
            <div class="bg-blue-50 p-2 rounded-lg space-y-2 mt-2">
              <div class="text-xs font-semibold text-blue-800">Thêm đợt khám / tái khám mới:</div>
              <div class="flex space-x-1">
                <input type="date" id="h-date-${p.id}" value="${new Date().toISOString().split('T')[0]}" class="text-xs border p-1 rounded w-1/3 bg-white">
                <input type="text" id="h-note-${p.id}" placeholder="Thông tin khám (vd: đã khám, đơn thuốc...)" class="text-xs border p-1 rounded flex-1 bg-white focus:outline-none focus:border-blue-500">
              </div>
              <button onclick="PatientManager.addHistory('${p.id}')" class="w-full bg-blue-600 text-white text-xs py-1 rounded font-medium hover:bg-blue-700">＋ Thêm Lịch Sử Khám</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleSearch(e) {
    this.searchKeyword = e.target.value;
    this.render();
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
    
    // Tự động điền tên vừa thêm vào ô tìm kiếm để hiển thị ngay bệnh nhân đó
    this.searchKeyword = newPatient.name;
    const searchInput = document.getElementById('p-search');
    if (searchInput) searchInput.value = newPatient.name;

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
    if (!confirm('Bạn có muốn xóa mục lịch sử khám này không?')) return;
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
    const today = new Date().toISOString().split('T')[0];
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
    a.download = `patients_backup_${new Date().toISOString().split('T')[0]}.json`;
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
