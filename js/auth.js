import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

export const AuthManager = {
  init() {
    onAuthStateChanged(auth, (user) => {
      const authScreen = document.getElementById('auth-screen');
      const mainApp = document.getElementById('main-app-container');

      if (user) {
        // Đã đăng nhập -> Ẩn màn hình khóa, hiện app chính
        if (authScreen) authScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Khởi động dữ liệu
        if (window.PatientManager && typeof window.PatientManager.init === 'function') {
          window.PatientManager.init();
        }
        if (window.TodoManager && typeof window.TodoManager.init === 'function') {
          window.TodoManager.init();
        }
      } else {
        // Chưa đăng nhập -> Hiện màn hình khóa, ẩn app chính
        if (authScreen) authScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
      }
    });
  },

  async login() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorEl = document.getElementById('auth-error');

    try {
      errorEl.textContent = '';
      await signInWithEmailAndPassword(auth, email, password);
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