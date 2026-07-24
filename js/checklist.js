// Default Streamer Checklist Items
const DEFAULT_TASKS = [
  { id: 1, title: '開播準備與招呼觀眾', done: true },
  { id: 2, title: '乾爹工商講稿與品牌宣傳', done: false },
  { id: 3, title: '主要遊戲與節目實況', done: false },
  { id: 4, title: '觀眾互動問答與抽獎', done: false },
  { id: 5, title: '宣傳下集時間與晚安下播', done: false }
];

// Helper to parse URL query parameters
function loadTasksFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemsParam = urlParams.get('items');
  const titleParam = urlParams.get('title');

  if (titleParam) {
    checklistTitle = decodeURIComponent(titleParam);
  }

  if (itemsParam) {
    try {
      const parsed = itemsParam.split('|').map((itemStr, i) => {
        const parts = itemStr.split(',');
        const title = decodeURIComponent(parts[0] || '').trim();
        const done = parts[1] === '1';
        return {
          id: i + 1,
          title: title || `任務 ${i + 1}`,
          done: done
        };
      }).filter(t => t.title);

      if (parsed.length > 0) return parsed;
    } catch(e) {
      console.error('Error parsing tasks from URL:', e);
    }
  }

  return JSON.parse(localStorage.getItem('obs_checklist_tasks')) || DEFAULT_TASKS;
}

// State Variables
let checklistTitle = "主播備忘錄 & 待辦事項";
let tasks = loadTasksFromSource();
let activeNavIndex = 0;
let hideCompleted = false;

// DOM Elements
const tasksListContainer = document.getElementById('tasks-list-container');
const cardTitleEl = document.getElementById('card-title');

function renderTasks() {
  if (cardTitleEl) cardTitleEl.textContent = checklistTitle;
  if (!tasksListContainer) return;

  tasksListContainer.innerHTML = '';

  const visibleTasks = hideCompleted ? tasks.filter(t => !t.done) : tasks;

  if (visibleTasks.length === 0) {
    tasksListContainer.innerHTML = `
      <div class="text-center text-slate-400 py-4 text-xs">
        🎉 所有待辦事項已完成！
      </div>
    `;
    return;
  }

  visibleTasks.forEach((task, index) => {
    const isNav = index === activeNavIndex;
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.done ? 'completed' : ''} ${isNav ? 'active-nav' : ''}`;
    
    taskEl.onclick = () => toggleTaskDone(task.id);

    taskEl.innerHTML = `
      <div class="checkbox-custom">
        ${task.done ? '<i class="fa-solid fa-check text-white text-[10px]"></i>' : ''}
      </div>
      <span class="text-xs font-bold flex-1 truncate">${escapeHtml(task.title)}</span>
    `;

    tasksListContainer.appendChild(taskEl);
  });

  saveTasksToStorage();
}

function toggleTaskDone(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    renderTasks();
    playCheckSound();
  }
}

function saveTasksToStorage() {
  localStorage.setItem('obs_checklist_tasks', JSON.stringify(tasks));
}

function toggleHideCompleted() {
  hideCompleted = !hideCompleted;
  const btn = document.getElementById('btn-toggle-completed');
  if (btn) {
    btn.innerHTML = hideCompleted 
      ? '<i class="fa-solid fa-eye mr-1"></i> 顯示已完成' 
      : '<i class="fa-solid fa-eye-slash mr-1"></i> 隱藏已完成';
  }
  renderTasks();
}

function toggleControlPanel() {
  const content = document.getElementById('panel-content');
  content?.classList.toggle('hidden');
}

function hideWholeControlPanel() {
  const panel = document.getElementById('control-panel');
  panel?.classList.add('hidden');
}

function toggleWholeControlPanel() {
  const panel = document.getElementById('control-panel');
  panel?.classList.toggle('hidden');
}

// Edit Modal Functions
function openEditModal() {
  const container = document.getElementById('modal-tasks-list');
  const titleInput = document.getElementById('checklist-title-input');

  if (titleInput) titleInput.value = checklistTitle;
  if (!container) return;

  container.innerHTML = '';

  tasks.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700';
    row.innerHTML = `
      <input type="checkbox" ${t.done ? 'checked' : ''} class="task-done-check accent-purple-600 w-4 h-4">
      <input type="text" value="${escapeHtml(t.title)}" placeholder="備忘事項內容" class="task-title-input flex-1 bg-slate-800 border border-slate-600 rounded px-2.5 py-1 text-xs text-white">
      <button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 px-1 text-xs"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
  });

  document.getElementById('edit-modal')?.classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal')?.classList.add('hidden');
}

function addNewTaskRow() {
  const container = document.getElementById('modal-tasks-list');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700';
  row.innerHTML = `
    <input type="checkbox" class="task-done-check accent-purple-600 w-4 h-4">
    <input type="text" value="新備忘事項" class="task-title-input flex-1 bg-slate-800 border border-slate-600 rounded px-2.5 py-1 text-xs text-white">
    <button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 px-1 text-xs"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(row);
}

function saveEditedTasks() {
  const rows = document.querySelectorAll('#modal-tasks-list > div');
  const titleInput = document.getElementById('checklist-title-input');

  if (titleInput) {
    checklistTitle = titleInput.value.trim() || "主播備忘錄";
  }

  const newTasks = [];
  rows.forEach((row, i) => {
    const done = row.querySelector('.task-done-check').checked;
    const title = row.querySelector('.task-title-input').value.trim() || `事項 ${i + 1}`;
    newTasks.push({ id: i + 1, title, done });
  });

  if (newTasks.length > 0) {
    tasks = newTasks;
    renderTasks();
  }

  closeEditModal();
}

function resetDefaultTasks() {
  tasks = [...DEFAULT_TASKS];
  checklistTitle = "主播備忘錄 & 待辦事項";
  localStorage.removeItem('obs_checklist_tasks');
  openEditModal();
}

function playCheckSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch(e) {}
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keyboard Hotkeys Support (H: toggle panel, Space: toggle current nav task, ArrowUp/Down: navigate)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === 'ArrowDown') {
    activeNavIndex = Math.min(activeNavIndex + 1, tasks.length - 1);
    renderTasks();
  } else if (e.key === 'ArrowUp') {
    activeNavIndex = Math.max(activeNavIndex - 1, 0);
    renderTasks();
  } else if (e.key === ' ') {
    e.preventDefault();
    const currentTask = tasks[activeNavIndex];
    if (currentTask) toggleTaskDone(currentTask.id);
  }
});

window.onload = function() {
  renderTasks();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
