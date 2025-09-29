const tasksContainer = document.getElementById('tasksContainer');
const modal = document.getElementById('taskModal');
const form = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeBtn = document.querySelector('.closeBtn');
const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleTheme');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Modal control
addTaskBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

// Theme toggle
toggleThemeBtn.onclick = () => document.body.classList.toggle('dark');

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value;
  const dueDate = document.getElementById('taskDate').value;
  const priority = document.getElementById('taskPriority').value;
  const category = document.getElementById('taskCategory').value;

  const task = {
    id: Date.now(),
    title,
    dueDate,
    priority,
    category,
    created: new Date().toISOString(),
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  form.reset();
  modal.style.display = 'none';
  scheduleReminder(task);
});

// Search filter
searchInput.addEventListener('input', () => renderTasks(searchInput.value));

function renderTasks(filter = "") {
  tasksContainer.innerHTML = '';
  tasks
    .filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task';

      const now = new Date();
      const created = new Date(task.created);
      const due = new Date(task.dueDate);
      const total = (due - created) / (1000 * 60 * 60 * 24);
      const elapsed = (now - created) / (1000 * 60 * 60 * 24);
      const progress = Math.min((elapsed / total) * 100, 100).toFixed(0);

      taskEl.innerHTML = `
        <h3>${task.title}</h3>
        <small>📅 ${task.dueDate} | 📁 ${task.category}</small>
        <span class="priority ${task.priority}">${task.priority}</span>
        <div class="progress-bar"><div class="progress" style="width:${progress}%"></div></div>
        <div class="actions">
          <button onclick="completeTask(${task.id})">✔️</button>
          <button onclick="deleteTask(${task.id})">🗑️</button>
        </div>
      `;
      tasksContainer.appendChild(taskEl);
    });
}

function completeTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: true } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Notifications
function scheduleReminder(task) {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const dueTime = new Date(task.dueDate).getTime();
  const reminderTime = dueTime - Date.now() - (60 * 60 * 1000); // 1 hour before

  if (reminderTime > 0) {
    setTimeout(() => {
      new Notification("⏰ Task Reminder", {
        body: `"${task.title}" is due soon!`,
      });
    }, reminderTime);
  }
}

renderTasks();
