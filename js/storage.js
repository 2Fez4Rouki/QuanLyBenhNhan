import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIrXhvz31PzAtJrK2WnZJMirbU09ahMWo",
  authDomain: "medicaltask-b4d8c.firebaseapp.com",
  projectId: "medicaltask-b4d8c",
  storageBucket: "medicaltask-b4d8c.firebasestorage.app",
  messagingSenderId: "913701784617",
  appId: "1:913701784617:web:e5ca081d48d345268da038"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CLOUD_DOC_REF = doc(db, "meditask", "main_data");

export const Storage = {
  // Đẩy dữ liệu từ máy lên Cloud
  async syncToCloud() {
    try {
      const patients = JSON.parse(localStorage.getItem('patients_db') || '[]');
      const todos = JSON.parse(localStorage.getItem('todos_db') || '[]');
      await setDoc(CLOUD_DOC_REF, { patients, todos });
      console.log("☁️ Đã đẩy dữ liệu lên Firebase Cloud thành công!");
    } catch (err) {
      console.error("❌ Lỗi đẩy dữ liệu lên Cloud:", err);
    }
  },

  getPatients() {
    const data = localStorage.getItem('patients_db');
    return data ? JSON.parse(data) : [];
  },

  savePatients(patients) {
    localStorage.setItem('patients_db', JSON.stringify(patients));
    this.syncToCloud();
  },

  getTodos() {
    const data = localStorage.getItem('todos_db');
    return data ? JSON.parse(data) : [];
  },

  saveTodos(todos) {
    localStorage.setItem('todos_db', JSON.stringify(todos));
    this.syncToCloud();
  }
};

// ⚡ LẮNG NGHE THAY ĐỔI THỜI GIAN THỰC (REAL-TIME SYNC)
// Khi có bất kỳ thay đổi nào trên Cloud, hàm này sẽ tự động chạy ngay lập tức
onSnapshot(CLOUD_DOC_REF, (docSnap) => {
  if (docSnap.exists()) {
    const cloudData = docSnap.data();
    let hasChanged = false;

    if (cloudData.patients) {
      const localPatients = localStorage.getItem('patients_db');
      const newPatientsStr = JSON.stringify(cloudData.patients);
      if (localPatients !== newPatientsStr) {
        localStorage.setItem('patients_db', newPatientsStr);
        hasChanged = true;
      }
    }

    if (cloudData.todos) {
      const localTodos = localStorage.getItem('todos_db');
      const newTodosStr = JSON.stringify(cloudData.todos);
      if (localTodos !== newTodosStr) {
        localStorage.setItem('todos_db', newTodosStr);
        hasChanged = true;
      }
    }

    // Nếu dữ liệu trên mây khác với local, tự động cập nhật lại giao diện ngay lập tức
    if (hasChanged) {
      console.log("⚡ Dữ liệu trên Cloud đã cập nhật, đang làm mới giao diện...");
      if (typeof window.PatientManager !== 'undefined' && typeof window.PatientManager.init === 'function') {
        window.PatientManager.init();
      }
      if (typeof window.TodoManager !== 'undefined' && typeof window.TodoManager.init === 'function') {
        window.TodoManager.init();
      }
    }
  }
});

window.Storage = Storage;
