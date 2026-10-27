document.addEventListener('DOMContentLoaded', () => {
  PatientManager.init();
  TodoManager.init();

  // Đăng ký Service Worker cho PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered!'))
      .catch(err => console.log('SW registration failed: ', err));
  }
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('bg-blue-600', 'text-white');
    el.classList.add('bg-gray-200', 'text-gray-700');
  });

  document.getElementById(tabId).classList.remove('hidden');
  const activeBtn = document.getElementById(`btn-${tabId}`);
  activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
  activeBtn.classList.add('bg-blue-600', 'text-white');
}
