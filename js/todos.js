const TodoManager = {
  init() {
    this.render();
  },

  render() {
    const todos = Storage.getTodos();
    const container = document.getElementById('todo-list');
    if (!container) return;

    if (todos.length === 0) {
      container.innerHTML = `<p class="text-gray-500 text-center py-4">Chưa có công việc nào.</p>`;
      return;
    }

    container.innerHTML = todos.map(todo => {
      const completedSubs = todo.subtasks ? todo.subtasks.filter(s => s.completed).length : 0;
      const totalSubs = todo.subtasks ? todo.subtasks.length : 0;
      const percent = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : (todo.completed ? 100 : 0);

      return `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="TodoManager.toggleTodo('${todo.id}')" class="w-5 h-5 text-blue-600 rounded">
              <span class="font-bold text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}">${todo.title}</span>
            </div>
            <button onclick="TodoManager.deleteTodo('${todo.id}')" class="text-red-500 hover:text-red-700 text-sm">Xóa</button>
          </div>
          
          <!-- Sub-tasks -->
          <div class="ml-8 mt-2 space-y-1">
            ${(todo.subtasks || []).map(sub => `
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" ${sub.completed ? 'checked' : ''} onchange="TodoManager.toggleSub('${todo.id}', '${sub.id}')" class="w-4 h-4 text-blue-500 rounded">
                  <span class="${sub.completed ? 'line-through text-gray-400' : 'text-gray-600'}">${sub.title}</span>
                </label>
                <button onclick="TodoManager.deleteSub('${todo.id}', '${sub.id}')" class="text-gray-400 hover:text-red-500 text-xs">✕</button>
              </div>
            `).join('')}
            
            <div class="flex mt-2 space-x-2">
              <input type="text" id="sub-input-${todo.id}" placeholder="Thêm sub-task..." class="text-xs border rounded px-2 py-1 flex-1 focus:outline-none focus:border-blue-500">
              <button onclick="TodoManager.addSub('${todo.id}')" class="bg-gray-100 hover:bg-gray-200 text-xs px-2 py-1 rounded font-medium">Thêm</button>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-blue-600 h-1.5 transition-all duration-300" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  addTodo(e) {
    e.preventDefault();
    const todos = Storage.getTodos();
    const newTodo = {
      id: Date.now().toString(),
      title: document.getElementById('todo-title').value,
      completed: false,
      subtasks: []
    };
    todos.push(newTodo);
    Storage.saveTodos(todos);
    this.render();
    e.target.reset();
  },

  toggleTodo(id) {
    let todos = Storage.getTodos();
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    Storage.saveTodos(todos);
    this.render();
  },

  deleteTodo(id) {
    let todos = Storage.getTodos();
    todos = todos.filter(t => t.id !== id);
    Storage.saveTodos(todos);
    this.render();
  },

  addSub(todoId) {
    const input = document.getElementById(`sub-input-${todoId}`);
    if (!input || !input.value.trim()) return;
    let todos = Storage.getTodos();
    todos = todos.map(t => {
      if (t.id === todoId) {
        t.subtasks = t.subtasks || [];
        t.subtasks.push({ id: Date.now().toString(), title: input.value.trim(), completed: false });
      }
      return t;
    });
    Storage.saveTodos(todos);
    this.render();
  },

  toggleSub(todoId, subId) {
    let todos = Storage.getTodos();
    todos = todos.map(t => {
      if (t.id === todoId) {
        t.subtasks = t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
      }
      return t;
    });
    Storage.saveTodos(todos);
    this.render();
  },

  deleteSub(todoId, subId) {
    let todos = Storage.getTodos();
    todos = todos.map(t => {
      if (t.id === todoId) {
        t.subtasks = t.subtasks.filter(s => s.id !== subId);
      }
      return t;
    });
    Storage.saveTodos(todos);
    this.render();
  }
};
