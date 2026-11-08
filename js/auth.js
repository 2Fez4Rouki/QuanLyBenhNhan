import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// 🔒 Ép Firebase không lưu phiên đăng nhập vĩnh viễn (Mỗi lần bật lại app đều hiện màn hình xác thực)
setPersistence(auth, inMemoryPersistence).catch((error) => {
  console.error("Lỗi cấu hình persistence:", error);
});

export const AuthManager = {
  init() {
    // 💡 Tự động điền Email & Mật khẩu nếu người dùng đã tích chọn "Nhớ mật khẩu" trước đó
    const savedEmail = localStorage.getItem('meditask_saved_email');
    const savedPassword = localStorage.getItem('meditask_saved_password');
    
    if (savedEmail && savedPassword) {
      const emailInput = document.getElementById('auth-email');
      const passInput = document.getElementById('auth-password');
      const rememberCheckbox = document.getElementById('remember-me');
      
      if (emailInput) emailInput.value = savedEmail;
      if (passInput) passInput.value = savedPassword;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    onAuthStateChanged(auth, (user) => {
      const authScreen = document.getElementById('auth-screen');
      const mainApp = document.getElementById('main-app-container');

      if (user) {
        // Đã bấm Đăng nhập thành công trong phiên hiện tại -> Mở app chính
        if (authScreen) authScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        if (window.PatientManager && typeof window.PatientManager.init === 'function') {
          window.PatientManager.init();
        }
        if (window.TodoManager && typeof window.TodoManager.init === 'function') {
          window.TodoManager.init();
        }
      } else {
        // Mới bật lại app / chưa đăng nhập -> Khóa ứng dụng
        if (authScreen) authScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
      }
    });
  },

  async login() {
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const rememberCheckbox = document.getElementById('remember-me');
    const errorEl = document.getElementById('auth-error');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'Vui lòng nhập đầy đủ Email và Mật khẩu!';
      return;
    }

    try {
      if (errorEl) errorEl.textContent = '';
      await signInWithEmailAndPassword(auth, email, password);

      // 💾 Xử lý lưu hoặc xóa dữ liệu theo trạng thái ô tích "Nhớ mật khẩu"
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('meditask_saved_email', email);
        localStorage.setItem('meditask_saved_password', password);
      } else {
        localStorage.removeItem('meditask_saved_email');
        localStorage.removeItem('meditask_saved_password');
      }
    } catch (err) {
      console.error(err);
      if (errorEl) errorEl.textContent = 'Sai email hoặc mật khẩu!';
    }
  }
};

window.AuthManager = AuthManager;
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});