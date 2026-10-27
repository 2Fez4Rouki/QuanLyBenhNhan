// Import Firebase SDK từ CDN chính thức
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// THAY THẾ ĐOẠN CẤU HÌNH NÀY BẰNG CỦA BẠN (TỪ BƯỚC 1)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDIrXhvz31PzAtJrK2WnZJMirbU09ahMWo",
  authDomain: "medicaltask-b4d8c.firebaseapp.com",
  projectId: "medicaltask-b4d8c",
  storageBucket: "medicaltask-b4d8c.firebasestorage.app",
  messagingSenderId: "913701784617",
  appId: "1:913701784617:web:e5ca081d48d345268da038"
};

// Khởi tạo Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOUD_DOC_REF = doc(db, "meditask", "main_data");

const Storage = {
  // Đồng bộ dữ liệu từ Cloud về máy khi khởi động app
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
        console.log("Đã đồng bộ dữ liệu từ Firebase Cloud thành công!");
        // Gọi lại render nếu các đối tượng quản lý đã sẵn sàng
        if (typeof PatientManager !== 'undefined') PatientManager.init();
        if (typeof TodoManager !== 'undefined') TodoManager.init();
      }
    } catch (err) {
      console.log("Không thể kết nối Cloud, đang dùng dữ liệu offline trên máy:", err);
    }
  },

  // Đẩy dữ liệu từ máy lên Cloud ngầm
  async syncToCloud() {
    try {
      const patients = JSON.parse(localStorage.getItem('patients_db') || '[]');
      const todos = JSON.parse(localStorage.getItem('todos_db') || '[]');
      await setDoc(CLOUD_DOC_REF, { patients, todos });
      console.log("Đã lưu dữ liệu lên Firebase Cloud!");
    } catch (err) {
      console.error("Lỗi đồng bộ lên Cloud:", err);
    }
  },

  getPatients() {
    const data = localStorage.getItem('patients_db');
    return data ? JSON.parse(data) : [];
  },

  savePatients(patients) {
    localStorage.setItem('patients_db', JSON.stringify(patients));
    this.syncToCloud(); // Tự động đẩy lên mây khi thay đổi
  },

  getTodos() {
    const data = localStorage.getItem('todos_db');
    return data ? JSON.parse(data) : [];
  },

  saveTodos(todos) {
    localStorage.setItem('todos_db', JSON.stringify(todos));
    this.syncToCloud(); // Tự động đẩy lên mây khi thay đổi
  }
};

// Gắn Storage ra biến toàn cục để các file JS khác gọi bình thường
window.Storage = Storage;

// Tự động kéo dữ liệu mới nhất từ Cloud ngay khi mở app
Storage.syncFromCloud();
