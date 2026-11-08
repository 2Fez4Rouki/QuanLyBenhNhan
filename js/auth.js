import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { Storage } from './storage.js'; // Import Storage để gọi hàm kích hoạt lắng nghe

const firebaseConfig = {
  apiKey: "AIzaSyDIrXhvz31PzAtJrK2WnZJMirbU09ahMWo",
  authDomain: "medicaltask-b4d8c.firebaseapp.com",
  projectId: "medicaltask-b4d8c",
  storageBucket: "medicaltask-b4d8c.firebasestorage.app",
  messagingSenderId: "913701784617",
  appId: "1:913701784617:web:e5ca081d48d345268da038"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, inMemoryPersistence).catch((error) => {
  console.error("Lỗi cấu hình persistence:", error);
});

export const AuthManager = {
  init() {
    const savedEmail = localStorage.getItem('meditask_saved_email');
    const savedPass = localStorage.getItem('meditask_saved_password');
    
    if (savedEmail) document.getElementById('auth-email').value = savedEmail;
    if (savedPass) {
      document.getElementById('auth-password').value = savedPass;
      const rememberCheckbox = document.getElementById('remember-pass');
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    onAuthStateChanged(auth, (user) => {
      const authScreen = document.getElementById('auth-screen');
      const mainApp = document.getElementById('main-app-container');

      if (user) {
        // Đã đăng nhập thành công -> Hiện giao diện chính
        if (authScreen) authScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // 🚀 KÍCH HOẠT LẮNG NGHE REALTIME AN TOÀN TẠI ĐÂY (Đã có quyền Auth)
        Storage.initListener();

        // Khởi động các Manager giao diện
        if (window.PatientManager && typeof window.PatientManager.init === 'function') {
          window.PatientManager.init();
        }
        if (window.TodoManager && typeof window.TodoManager.init === 'function') {
          window.TodoManager.init();
        }
      } else {
        // Chưa đăng nhập -> Hiện màn hình khóa
        if (authScreen) authScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
      }
    });
  },

  async login() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const rememberCheckbox = document.getElementById('remember-pass');
    const errorEl = document.getElementById('auth-error');

    try {
      errorEl.textContent = '';
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('meditask_saved_email', email);
        localStorage.setItem('meditask_saved_password', password);
      } else {
        localStorage.removeItem('meditask_saved_email');
        localStorage.removeItem('meditask_saved_password');
      }
    } catch (err) {
      console.error(err);
      errorEl.textContent = 'Sai email hoặc mật khẩu!';
    }
  }
};

window.AuthManager = AuthManager;
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});