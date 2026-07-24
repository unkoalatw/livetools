// Achievement State
let achieveTitle = "首次單場 20 殺！";
let achieveDesc = "你已解鎖這個史詩成就";
let displayDuration = 5; // seconds to stay visible

function loadAchieveFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const titleParam = urlParams.get('title');
  const descParam = urlParams.get('desc');
  const durParam = urlParams.get('duration');

  if (titleParam) achieveTitle = decodeURIComponent(titleParam);
  if (descParam) achieveDesc = decodeURIComponent(descParam);
  if (durParam) displayDuration = parseInt(durParam, 10) || 5;
}

loadAchieveFromSource();

function triggerAchievement(customTitle, customDesc) {
  const banner = document.getElementById('achieve-banner');
  const titleEl = document.getElementById('achieve-title');
  const descEl = document.getElementById('achieve-desc');

  if (titleEl) titleEl.textContent = (customTitle || achieveTitle).substring(0, 35);
  if (descEl) descEl.textContent = (customDesc || achieveDesc).substring(0, 40);

  // Play achievement unlock sound
  playAchieveSound();
  spawnSparkles();

  // Slide in
  banner.classList.remove('hide-out');
  banner.classList.add('show');

  // Auto dismiss
  setTimeout(() => {
    banner.classList.remove('show');
    banner.classList.add('hide-out');
  }, displayDuration * 1000);
}

function spawnSparkles() {
  const banner = document.getElementById('achieve-banner');
  for (let i = 0; i < 12; i++) {
    const spark = document.createElement('div');
    spark.className = 'sparkle';
    spark.style.left = Math.random() * 100 + '%';
    spark.style.top = Math.random() * 100 + '%';
    spark.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
    spark.style.setProperty('--dy', (Math.random() - 0.5) * 80 + 'px');
    spark.style.animationDelay = Math.random() * 0.3 + 's';
    banner.appendChild(spark);
    setTimeout(() => spark.remove(), 1200);
  }
}

function playAchieveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  } catch(e) {}
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

// Keyboard Hotkeys: Space or A to trigger, H toggle panel
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === ' ' || e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    const customTitle = document.getElementById('custom-title-input')?.value;
    const customDesc = document.getElementById('custom-desc-input')?.value;
    triggerAchievement(customTitle || null, customDesc || null);
  }
});

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }

  // Auto-trigger on load if autoplay param is set
  if (urlParams.get('autoplay') === 'true') {
    setTimeout(() => triggerAchievement(), 1000);
  }
};
