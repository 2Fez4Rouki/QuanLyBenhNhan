import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
  async syncFromCloud() {
    try {
      const docSnap = await getDoc(CLOUD_DOC_REF);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData.patients) {
          localStorage.setItem('patients_db', JSON.stringify(cloudData.patients));
        }
        if (cloudData.todos) {
          localStorage.setItem('todos_db', JSON.stringify(cloudData.todos));
        }
        console.log("✅ Đã đồng bộ dữ liệu từ Firebase Cloud thành công!");
        if (typeof PatientManager !== 'undefined') PatientManager.init();
        if (typeof TodoManager !== 'undefined') TodoManager.init();
      }
    } catch (err) {
      console.error("❌ Lỗi kết nối Cloud:", err);
    }
  },

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

window.Storage = Storage;
Storage.syncFromCloud();
