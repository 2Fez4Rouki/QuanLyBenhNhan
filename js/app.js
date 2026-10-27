import { Storage } from './storage.js';

// Hàm chuyển tab toàn cục
window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove('hidden');

  const targetBtn = document.getElementById('btn-' + tabId);
  if (targetBtn) {
    targetBtn.classList.remove('bg-gray-200', 'text-gray-700');
    targetBtn.classList.add('bg-blue-600', 'text-white');
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
