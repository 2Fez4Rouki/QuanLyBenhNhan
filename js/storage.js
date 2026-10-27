const Storage = {
  getPatients() {
    const data = localStorage.getItem('patients_db');
    return data ? JSON.parse(data) : [];
  },
  savePatients(patients) {
    localStorage.setItem('patients_db', JSON.stringify(patients));
  },
  getTodos() {
    const data = localStorage.getItem('todos_db');
    return data ? JSON.parse(data) : [];
  },
  saveTodos(todos) {
    localStorage.setItem('todos_db', JSON.stringify(todos));
  }
};
