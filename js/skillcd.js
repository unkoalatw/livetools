// Default skill slots
let skills = [
  { label: "閃現", icon: "fa-bolt", cd: 300, remaining: 0, timer: null },
  { label: "大招", icon: "fa-explosion", cd: 90, remaining: 0, timer: null },
  { label: "傳送", icon: "fa-circle-nodes", cd: 240, remaining: 0, timer: null },
  { label: "治癒", icon: "fa-heart-pulse", cd: 180, remaining: 0, timer: null },
];

function loadSkillsFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const skillsParam = urlParams.get('skills');
  if (skillsParam) {
    try {
      // Format: name,icon,cd|name,icon,cd
      const parsed = decodeURIComponent(skillsParam).split('|').map(s => {
        const parts = s.split(',');
        return {
          label: parts[0] || "技能",
          icon: parts[1] || "fa-bolt",
          cd: parseInt(parts[2], 10) || 60,
          remaining: 0,
          timer: null
        };
      });
      if (parsed.length > 0) skills = parsed;
    } catch (e) { console.warn("skills parse error", e); }
  }
}

loadSkillsFromSource();

function formatCD(seconds) {
  if (seconds <= 0) return "";
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }
  return `${seconds}s`;
}

function renderSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;
  container.innerHTML = '';

  skills.forEach((skill, idx) => {
    const isOnCD = skill.remaining > 0;
    const slot = document.createElement('div');
    slot.className = `skill-slot ${isOnCD ? 'on-cd' : 'ready'}`;
    slot.title = `${skill.label} (按 ${idx + 1} 或點擊啟動冷卻)`;
    slot.onclick = () => startCD(idx);

    // CD overlay percentage
    const pct = isOnCD ? (skill.remaining / skill.cd) * 100 : 0;
    const cdOverlay = document.createElement('div');
    cdOverlay.className = 'cd-overlay';
    cdOverlay.style.clipPath = isOnCD
      ? `inset(${100 - pct}% 0 0 0)`
      : 'none';

    const iconEl = document.createElement('i');
    iconEl.className = `fa-solid ${skill.icon} skill-icon`;

    const cdText = document.createElement('div');
    cdText.className = 'skill-cd-text';
    cdText.textContent = formatCD(skill.remaining);

    slot.appendChild(cdOverlay);
    slot.appendChild(iconEl);
    slot.appendChild(cdText);

    container.appendChild(slot);
  });
}

function startCD(idx) {
  const skill = skills[idx];
  if (skill.remaining > 0) {
    // Reset if already on CD
    clearInterval(skill.timer);
    skill.remaining = 0;
    skill.timer = null;
    renderSkills();
    return;
  }

  skill.remaining = skill.cd;
  playStartSound();
  renderSkills();

  skill.timer = setInterval(() => {
    skill.remaining--;
    if (skill.remaining <= 0) {
      skill.remaining = 0;
      clearInterval(skill.timer);
      skill.timer = null;
      playReadySound();
    }
    renderSkills();
  }, 1000);
}

function playStartSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

function playReadySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.1].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(i === 0 ? 880 : 1100, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
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

// Keyboard Hotkeys: 1-4 start CD, H toggle panel
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key, 10) - 1;
    if (idx < skills.length) startCD(idx);
  }
});

window.onload = function() {
  renderSkills();
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
