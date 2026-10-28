import { Storage } from './storage.js';

// Hàm chuyển tab toàn cục
window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-teal-400', 'text-blue-950');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove('hidden');

  const targetBtn = document.getElementById('btn-' + tabId);
  if (targetBtn) {
    targetBtn.classList.remove('bg-gray-200', 'text-gray-700');
    targetBtn.classList.add('bg-teal-400', 'text-blue-950');
  }
};

// Hàm chuyển sang tab Bệnh nhân và tìm kiếm chính xác tên/SĐT bệnh nhân đó
window.jumpToPatient = function(keyword) {
  // 1. Chuyển sang tab bệnh nhân bằng hàm switchTab có sẵn
  window.switchTab('tab-patients');
  
  // 2. Gọi hàm tìm kiếm và focus vào bệnh nhân đó
  if (window.PatientManager && typeof window.PatientManager.searchAndFocus === 'function') {
    window.PatientManager.searchAndFocus(keyword);
  }
};

// Đảm bảo khi DOM tải xong thì khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Ứng dụng đã khởi động thành công!");
  
  if (window.PatientManager && typeof window.PatientManager.init === 'function') {
    window.PatientManager.init();
  }
  if (window.TodoManager && typeof window.TodoManager.init === 'function') {
    window.TodoManager.init();
  }
});
