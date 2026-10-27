const PatientManager = {
  init() {
    this.render();
    this.checkReminders();
  },

  render() {
    const patients = Storage.getPatients();
    const container = document.getElementById('patient-list');
    if (!container) return;

    if (patients.length === 0) {
      container.innerHTML = `<p class="text-gray-500 text-center py-4">Chưa có dữ liệu bệnh nhân nào.</p>`;
      return;
    }

    container.innerHTML = patients.map(p => `
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
          <strong>Ghi chú:</strong> ${p.note || 'Không có'}
        </div>
      </div>
    `).join('');
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
