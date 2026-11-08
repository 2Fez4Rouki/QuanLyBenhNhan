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

function formatDateVN(dateString) {
  if (!dateString) return '';
  if (dateString.length === 4) return dateString; 
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj).sort().reduce((sorted, key) => {
    sorted[key] = sortObjectKeys(obj[key]);
    return sorted;
  }, {});
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CLOUD_DOC_REF = doc(db, "meditask", "main_data");

let unsubscribeListener = null;

export const Storage = {
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
  },

  // 📡 Hàm kích hoạt lắng nghe Realtime (chỉ gọi sau khi đã đăng nhập thành công)
  initListener() {
    if (unsubscribeListener) return; // Tránh đăng ký trùng lặp nhiều lần

    unsubscribeListener = onSnapshot(CLOUD_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        let hasChanged = false;

        if (cloudData.patients) {
          const localPatientsRaw = localStorage.getItem('patients_db');
          const localPatientsObj = localPatientsRaw ? JSON.parse(localPatientsRaw) : [];
          
          const currentCloudStr = JSON.stringify(sortObjectKeys(cloudData.patients));
          const currentLocalStr = JSON.stringify(sortObjectKeys(localPatientsObj));

          if (currentLocalStr !== currentCloudStr) {
            localStorage.setItem('patients_db', JSON.stringify(cloudData.patients));
            hasChanged = true;
          }
        }

        if (cloudData.todos) {
          const localTodosRaw = localStorage.getItem('todos_db');
          const localTodosObj = localTodosRaw ? JSON.parse(localTodosRaw) : [];

          const currentCloudStr = JSON.stringify(sortObjectKeys(cloudData.todos));
          const currentLocalStr = JSON.stringify(sortObjectKeys(localTodosObj));

          if (currentLocalStr !== currentCloudStr) {
            localStorage.setItem('todos_db', JSON.stringify(cloudData.todos));
            hasChanged = true;
          }
        }

        if (hasChanged) {
          console.log("⚡ Dữ liệu trên Cloud đã thay đổi, đang làm mới giao diện...");
          if (typeof window.PatientManager !== 'undefined' && typeof window.PatientManager.init === 'function') {
            window.PatientManager.init();
          }
          if (typeof window.TodoManager !== 'undefined' && typeof window.TodoManager.init === 'function') {
            window.TodoManager.init();
          }
        }
      }
    }, (error) => {
      console.error("❌ Lỗi kết nối Realtime Firestore:", error);
    });

    console.log("🟢 Đã khởi động bộ lắng nghe Realtime thành công!");
  }
};

window.Storage = Storage;