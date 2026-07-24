// State Variables for BRB Overlay
let brbTitle = "主播去拿水/上廁所，馬上回來！";
let elapsedSeconds = 0;
let isTimerActive = true;
let isCardVisible = true;
let brbInterval = null;

function loadBrbFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const titleParam = urlParams.get('title');

  if (titleParam) brbTitle = decodeURIComponent(titleParam);
}

loadBrbFromSource();

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${pad(mins)}:${pad(secs)}`;
}

function startBrbTimer() {
  if (brbInterval) clearInterval(brbInterval);

  brbInterval = setInterval(() => {
    if (isTimerActive && isCardVisible) {
      elapsedSeconds++;
      const timerEl = document.getElementById('brb-timer-el');
      if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    }
  }, 1000);
}

function toggleBrbCard() {
  isCardVisible = !isCardVisible;
  const card = document.getElementById('brb-card-el');
  const btnToggle = document.getElementById('btn-toggle-brb');

  if (card) {
    if (isCardVisible) {
      card.classList.remove('hidden-overlay');
    } else {
      card.classList.add('hidden-overlay');
    }
  }

  if (btnToggle) {
    btnToggle.innerHTML = isCardVisible
      ? '<i class="fa-solid fa-eye-slash mr-1"></i> 淡出關閉 BRB (B)'
      : '<i class="fa-solid fa-eye mr-1"></i> 顯示 BRB 卡片 (B)';
  }
}

function resetBrbTimer() {
  elapsedSeconds = 0;
  const timerEl = document.getElementById('brb-timer-el');
  if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
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

// Keyboard Hotkeys Support (B: toggle card, R: reset timer, H: toggle panel)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === 'b' || e.key === 'B') {
    toggleBrbCard();
  } else if (e.key === 'r' || e.key === 'R') {
    resetBrbTimer();
  }
});

window.onload = function() {
  const titleEl = document.getElementById('brb-title-el');
  if (titleEl) titleEl.textContent = brbTitle;

  startBrbTimer();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
