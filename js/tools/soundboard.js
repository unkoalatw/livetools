/* Soundboard Tool Logic */
export class SoundboardTool {
  constructor() {
    this.sounds = [
      { id: 'cheer', name: '🎉 歡呼勝利', type: 'fanfare' },
      { id: 'fail', name: '🎺 失敗音效', type: 'sad' },
      { id: 'coin', name: '🪙 金幣聲', type: 'coin' },
      { id: 'drum', name: '🥁 太鼓敲擊', type: 'drum' },
      { id: 'laser', name: '⚡ 激光發射', type: 'laser' },
      { id: 'bell', name: '🔔 訂閱叮咚', type: 'ding' },
    ];
  }

  init() {}

  renderHTML(containerEl, isObsMode = false) {
    containerEl.innerHTML = `
      <div class="soundboard-grid">
        ${this.sounds.map(s => `
          <button class="sound-btn" data-sound="${s.id}">
            <span>${s.name.split(' ')[0]}</span>
            <span>${s.name.split(' ')[1]}</span>
          </button>
        `).join('')}
      </div>
    `;

    containerEl.querySelectorAll('.sound-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const soundId = e.currentTarget.getAttribute('data-sound');
        this.playSound(soundId);
      });
    });
  }

  playSound(soundId) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      if (soundId === 'coin') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (soundId === 'bell') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1567.98, now); // G6
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (soundId === 'laser') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (soundId === 'cheer') {
        // Chord fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.2, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + 0.6);
        });
      } else if (soundId === 'fail') {
        [300, 280, 260, 240].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.3, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + 0.5);
        });
      } else {
        // Drum
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch(e) {
      console.log('Audio Context error:', e);
    }
  }
}
