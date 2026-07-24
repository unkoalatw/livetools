// State Variables for Streak Counter
let streakTitle = "今日遊戲戰績";
let wins = 0;
let losses = 0;
let streak = 0;

// Helper to parse URL query parameters
function loadStreakFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const titleParam = urlParams.get('title');
  const winsParam = urlParams.get('wins');
  const lossesParam = urlParams.get('losses');
  const streakParam = urlParams.get('streak');

  if (titleParam) streakTitle = decodeURIComponent(titleParam);
  if (winsParam) wins = parseInt(winsParam, 10) || 0;
  if (lossesParam) losses = parseInt(lossesParam, 10) || 0;
  if (streakParam) streak = parseInt(streakParam, 10) || 0;
}

loadStreakFromSource();

function renderStreak() {
  const titleEl = document.getElementById('streak-title-el');
  const winsEl = document.getElementById('wins-val');
  const lossesEl = document.getElementById('losses-val');
  const streakEl = document.getElementById('streak-val');
  const cardContainer = document.getElementById('streak-card-container');

  if (titleEl) titleEl.textContent = streakTitle;
  if (winsEl) winsEl.textContent = wins;
  if (lossesEl) lossesEl.textContent = losses;
  if (streakEl) streakEl.textContent = streak;

  if (cardContainer) {
    if (streak >= 3) {
      cardContainer.classList.add('on-fire');
    } else {
      cardContainer.classList.remove('on-fire');
    }
  }
}

function addWin() {
  wins++;
  streak++;
  renderStreak();
  playWinSound();
}

function addLoss() {
  losses++;
  streak = 0;
  renderStreak();
  playLossSound();
}

function resetStreak() {
  wins = 0;
  losses = 0;
  streak = 0;
  renderStreak();
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

function playWinSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch(e) {}
}

function playLossSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
}

// Keyboard Hotkeys Support (W or +: Win, L or -: Loss, R: Reset, H: toggle panel)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === '+' || e.key === '=' || e.key === 'w' || e.key === 'W') {
    addWin();
  } else if (e.key === '-' || e.key === '_' || e.key === 'l' || e.key === 'L') {
    addLoss();
  } else if (e.key === 'r' || e.key === 'R') {
    resetStreak();
  }
});

window.onload = function() {
  renderStreak();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
