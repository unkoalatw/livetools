/* Timer Tool Logic */
export class TimerTool {
  constructor() {
    this.interval = null;
    this.remainingSeconds = 600; // default 10 mins
    this.isRunning = false;
    this.title = "STREAM COUNTDOWN";
    this.color = "#06b6d4";
  }

  init(options = {}) {
    this.title = options.title || "STREAM COUNTDOWN";
    this.remainingSeconds = parseInt(options.minutes || 10, 10) * 60;
    this.color = options.color || "#06b6d4";
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(mins)}:${pad(secs)}`;
  }

  renderHTML(containerEl, isObsMode = false) {
    const colorStyle = `color: ${this.color}; text-shadow: 0 0 20px ${this.color}66;`;
    
    containerEl.innerHTML = `
      <div class="timer-display" style="${colorStyle}">
        <div class="timer-title" style="color: #f3f4f6;">${this.title}</div>
        <div id="timerDigits">${this.formatTime(this.remainingSeconds)}</div>
        ${!isObsMode ? `
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button id="btnTimerStart" class="btn btn-sm btn-primary">▶ 開始</button>
            <button id="btnTimerPause" class="btn btn-sm btn-secondary">⏸ 暫停</button>
            <button id="btnTimerReset" class="btn btn-sm btn-secondary">↺ 重置</button>
          </div>
        ` : ''}
      </div>
    `;

    if (!isObsMode) {
      this.attachControls(containerEl);
    }
  }

  attachControls(containerEl) {
    const startBtn = containerEl.querySelector('#btnTimerStart');
    const pauseBtn = containerEl.querySelector('#btnTimerPause');
    const resetBtn = containerEl.querySelector('#btnTimerReset');
    const digits = containerEl.querySelector('#timerDigits');

    startBtn?.addEventListener('click', () => this.start(digits));
    pauseBtn?.addEventListener('click', () => this.pause());
    resetBtn?.addEventListener('click', () => this.reset(digits));
  }

  start(digitsEl) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.interval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        if (digitsEl) digitsEl.textContent = this.formatTime(this.remainingSeconds);
      } else {
        this.pause();
        // Play beep chime sound using Web Audio API
        this.playBeep();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.interval) clearInterval(this.interval);
  }

  reset(digitsEl) {
    this.pause();
    this.remainingSeconds = 600;
    if (digitsEl) digitsEl.textContent = this.formatTime(this.remainingSeconds);
  }

  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch(e) {
      console.log('Audio Context error:', e);
    }
  }
}
