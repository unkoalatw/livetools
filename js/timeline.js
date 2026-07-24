// Initial Timeline Events
const DEFAULT_EVENTS = [
  { id: 1, title: '開播準備與雜談', time: '19:00', durationMinutes: 15, icon: 'fa-comments' },
  { id: 2, title: '主要遊戲實況', time: '19:15', durationMinutes: 45, icon: 'fa-gamepad' },
  { id: 3, title: '觀眾互動 QA', time: '20:00', durationMinutes: 20, icon: 'fa-users' },
  { id: 4, title: '抽獎與特別活動', time: '20:20', durationMinutes: 15, icon: 'fa-gift' },
  { id: 5, title: '晚安下播晚安', time: '20:35', durationMinutes: 10, icon: 'fa-moon' }
];

const DEFAULT_MARQUEE = "🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！";

// State Variables
let timerMode = 'auto'; // 'auto' or 'manual'
let displayView = 'timeline'; // 'timeline' or 'marquee'
let marqueeText = localStorage.getItem('obs_marquee_text') || DEFAULT_MARQUEE;
let events = loadEventsFromSource();
let activeIndex = 0;
let isTimerRunning = true;
let secondsLeftInStage = events[0] ? events[0].durationMinutes * 60 : 900;
let timerInterval = null;

// Helper to parse URL query parameters for OBS Browser Source customization
function loadEventsFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventsParam = urlParams.get('events');
  const modeParam = urlParams.get('mode');
  const viewParam = urlParams.get('view');
  const marqueeParam = urlParams.get('marquee');

  if (modeParam) timerMode = modeParam;
  if (viewParam) displayView = viewParam;
  if (marqueeParam) marqueeText = decodeURIComponent(marqueeParam);

  if (eventsParam) {
    try {
      const defaultIcons = ['fa-comments', 'fa-gamepad', 'fa-users', 'fa-gift', 'fa-coffee', 'fa-trophy', 'fa-star'];
      const parsed = eventsParam.split('|').map((itemStr, i) => {
        const parts = itemStr.split(',');
        const title = decodeURIComponent(parts[0] || '').trim();
        const durationMinutes = parseInt(parts[1] || '15', 10);
        return {
          id: i + 1,
          title: title || `階段 ${i + 1}`,
          time: '',
          durationMinutes: isNaN(durationMinutes) ? 15 : durationMinutes,
          icon: defaultIcons[i % defaultIcons.length]
        };
      }).filter(evt => evt.title);

      if (parsed.length > 0) {
        return parsed;
      }
    } catch(e) {
      console.error('Error parsing events from URL:', e);
    }
  }

  return JSON.parse(localStorage.getItem('obs_timeline_events')) || DEFAULT_EVENTS;
}

// DOM Elements
const mainContainer = document.getElementById('main-container');
const trackWrapper = document.getElementById('track-wrapper');
const timelineContainer = document.getElementById('timeline-nodes-container');
const marqueeContainer = document.getElementById('marquee-container');
const marqueeTextContent = document.getElementById('marquee-text-content');
const playPauseBtn = document.getElementById('play-pause-btn');

// Auto Adapt Layout for Vertical (200x2000) or Horizontal (2000x200)
function updateLayoutOrientation() {
  const isVertical = window.innerHeight > window.innerWidth;

  if (isVertical) {
    mainContainer.className = "w-full h-full flex flex-col justify-center items-center p-3 relative z-10";
    trackWrapper.className = "w-full h-full vertical-track-gradient rounded-3xl p-3 shadow-2xl border-2 border-white/50 backdrop-blur-md flex flex-col justify-center relative overflow-hidden";
    timelineContainer.className = "flex flex-col items-center justify-between gap-3 w-full h-full";
  } else {
    mainContainer.className = "w-full h-full flex justify-center items-center p-3 relative z-10";
    trackWrapper.className = "w-full max-w-full h-auto track-gradient rounded-full p-2.5 shadow-2xl border-2 border-white/50 backdrop-blur-md relative overflow-hidden";
    timelineContainer.className = "flex items-center justify-between gap-3 w-full h-full";
  }

  renderTimelineNodes();
  renderMarqueeText();
}

// Render Pill Nodes
function renderTimelineNodes() {
  if (!timelineContainer) return;
  timelineContainer.innerHTML = '';
  const isVertical = window.innerHeight > window.innerWidth;

  events.forEach((item, index) => {
    const isCurrent = index === activeIndex;
    const isDone = index < activeIndex;

    const pill = document.createElement('div');
    pill.className = `pill-node relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full font-extrabold cursor-pointer transition-all duration-300 min-w-0 ${
      isCurrent ? 'active' : isDone ? 'completed' : ''
    } ${isVertical ? 'w-full my-1' : 'h-full'}`;
    
    pill.onclick = () => jumpToStage(index);

    const iconClass = item.icon || 'fa-star';

    pill.innerHTML = `
      <div class="flex items-center justify-center gap-2 truncate text-center w-full">
        ${isCurrent ? '<span class="w-2 h-2 bg-red-500 rounded-full animate-ping shrink-0"></span>' : ''}
        <i class="fa-solid ${iconClass} text-xs ${isCurrent ? 'text-amber-300' : 'text-slate-700'}"></i>
        <span class="text-xs font-black truncate ${isCurrent ? 'text-white' : 'text-slate-800'}">${escapeHtml(item.title)}</span>
      </div>
    `;

    timelineContainer.appendChild(pill);
  });
}

// Render Marquee Text
function renderMarqueeText() {
  if (marqueeTextContent) {
    marqueeTextContent.innerHTML = `${escapeHtml(marqueeText)} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${escapeHtml(marqueeText)}`;
  }
}

// Toggle Display View Mode (Timeline vs Marquee)
function setDisplayView(view) {
  displayView = view;
  const btnTimeline = document.getElementById('btn-view-timeline');
  const btnMarquee = document.getElementById('btn-view-marquee');

  if (view === 'marquee') {
    timelineContainer?.classList.add('hidden');
    marqueeContainer?.classList.remove('hidden');
    marqueeContainer?.classList.add('flex');

    if (btnTimeline) btnTimeline.className = "py-1.5 text-[11px] rounded-md font-bold text-slate-400 hover:text-white border border-transparent transition";
    if (btnMarquee) btnMarquee.className = "py-1.5 text-[11px] rounded-md font-bold bg-indigo-600 text-white border border-indigo-400/50 shadow transition";
  } else {
    marqueeContainer?.classList.add('hidden');
    marqueeContainer?.classList.remove('flex');
    timelineContainer?.classList.remove('hidden');

    if (btnTimeline) btnTimeline.className = "py-1.5 text-[11px] rounded-md font-bold bg-indigo-600 text-white border border-indigo-400/50 shadow transition";
    if (btnMarquee) btnMarquee.className = "py-1.5 text-[11px] rounded-md font-bold text-slate-400 hover:text-white border border-transparent transition";
  }
}

function toggleDisplayView() {
  setDisplayView(displayView === 'timeline' ? 'marquee' : 'timeline');
}

// Main Timer Loop
function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isTimerRunning) return;

    if (secondsLeftInStage > 0) {
      secondsLeftInStage--;
    } else {
      if (timerMode === 'auto' && activeIndex < events.length - 1) {
        nextStage();
      }
    }
  }, 1000);
}

// Navigation Controls
function nextStage() {
  if (activeIndex < events.length - 1) {
    jumpToStage(activeIndex + 1);
  }
}

function prevStage() {
  if (activeIndex > 0) {
    jumpToStage(activeIndex - 1);
  }
}

function jumpToStage(index) {
  if (index < 0 || index >= events.length) return;
  activeIndex = index;
  const current = events[activeIndex];
  secondsLeftInStage = current ? current.durationMinutes * 60 : 300;
  renderTimelineNodes();
}

function toggleTimer() {
  isTimerRunning = !isTimerRunning;
  if (playPauseBtn) {
    playPauseBtn.innerHTML = isTimerRunning 
      ? '<i class="fa-solid fa-pause"></i> 暫停' 
      : '<i class="fa-solid fa-play"></i> 繼續';
    playPauseBtn.classList.toggle('bg-amber-500', isTimerRunning);
    playPauseBtn.classList.toggle('bg-emerald-500', !isTimerRunning);
  }
}

function setTimerMode(mode) {
  timerMode = mode;
  const autoBtn = document.getElementById('mode-auto');
  const manualBtn = document.getElementById('mode-manual');
  if (autoBtn) {
    autoBtn.className = mode === 'auto' 
      ? 'flex-1 py-1 text-[11px] rounded font-semibold bg-indigo-600 text-white' 
      : 'flex-1 py-1 text-[11px] rounded font-semibold text-slate-400 hover:text-white';
  }
  if (manualBtn) {
    manualBtn.className = mode === 'manual' 
      ? 'flex-1 py-1 text-[11px] rounded font-semibold bg-indigo-600 text-white' 
      : 'flex-1 py-1 text-[11px] rounded font-semibold text-slate-400 hover:text-white';
  }
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

// Modal Events Editor
function openEditModal() {
  const container = document.getElementById('modal-events-list');
  const marqueeInput = document.getElementById('marquee-input-text');
  
  if (marqueeInput) {
    marqueeInput.value = marqueeText;
  }

  if (!container) return;
  container.innerHTML = '';

  events.forEach((evt) => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700';
    row.innerHTML = `
      <input type="text" value="${escapeHtml(evt.title)}" placeholder="階段名稱" class="evt-title flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
      <input type="text" value="${escapeHtml(evt.time || '19:00')}" placeholder="19:00" class="evt-time w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
      <input type="number" value="${evt.durationMinutes}" placeholder="分鐘" class="evt-dur w-14 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
      <button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 px-1 text-xs"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
  });

  document.getElementById('edit-modal')?.classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal')?.classList.add('hidden');
}

function addNewEventRow() {
  const container = document.getElementById('modal-events-list');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700';
  row.innerHTML = `
    <input type="text" value="新階段內容" class="evt-title flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
    <input type="text" value="20:00" class="evt-time w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
    <input type="number" value="15" class="evt-dur w-14 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white">
    <button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-300 px-1 text-xs"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(row);
}

function saveEditedEvents() {
  const rows = document.querySelectorAll('#modal-events-list > div');
  const marqueeInput = document.getElementById('marquee-input-text');
  
  if (marqueeInput) {
    marqueeText = marqueeInput.value.trim() || DEFAULT_MARQUEE;
    localStorage.setItem('obs_marquee_text', marqueeText);
    renderMarqueeText();
  }

  const newEvents = [];
  const defaultIcons = ['fa-comments', 'fa-gamepad', 'fa-users', 'fa-gift', 'fa-coffee', 'fa-trophy', 'fa-star'];

  rows.forEach((row, i) => {
    const title = row.querySelector('.evt-title').value.trim() || '未命名階段';
    const time = row.querySelector('.evt-time').value.trim() || '00:00';
    const durationMinutes = parseInt(row.querySelector('.evt-dur').value, 10) || 15;
    const icon = defaultIcons[i % defaultIcons.length];

    newEvents.push({ id: i + 1, title, time, durationMinutes, icon });
  });

  if (newEvents.length > 0) {
    events = newEvents;
    localStorage.setItem('obs_timeline_events', JSON.stringify(events));
    activeIndex = 0;
    const first = events[0];
    secondsLeftInStage = first ? first.durationMinutes * 60 : 300;
    renderTimelineNodes();
  }

  closeEditModal();
}

function resetDefaultEvents() {
  events = [...DEFAULT_EVENTS];
  marqueeText = DEFAULT_MARQUEE;
  localStorage.removeItem('obs_timeline_events');
  localStorage.removeItem('obs_marquee_text');
  openEditModal();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keyboard Hotkeys Support (H: hide/show panel, M: toggle timeline/marquee view, Left/Right: switch stage, Space: pause/play)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === 'm' || e.key === 'M') {
    toggleDisplayView();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextStage();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prevStage();
  } else if (e.key === ' ') {
    e.preventDefault();
    toggleTimer();
  }
});

window.addEventListener('resize', updateLayoutOrientation);

window.onload = function() {
  updateLayoutOrientation();
  startTimerLoop();
  setDisplayView(displayView);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
