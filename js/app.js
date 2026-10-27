import { Storage } from './storage.js';

// Định nghĩa hàm chuyển tab và gắn trực tiếp vào window để HTML onclick gọi được
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

// Khởi tạo các Manager khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Ứng dụng đã sẵn sàng, đang khởi tạo các module...");
  
  if (typeof PatientManager !== 'undefined') {
    PatientManager.init();
  }
  if (typeof TodoManager !== 'undefined') {
    TodoManager.init();
  }
});
