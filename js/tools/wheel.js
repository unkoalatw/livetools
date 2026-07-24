/* Raffle / Decision Wheel Tool Logic */
export class WheelTool {
  constructor() {
    this.options = ["VIP 贈送", "懲罰遊戲", "加時 15 分鐘", "觀眾指定英雄", "再抽一次", "送點數卡"];
    this.colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];
    this.isSpinning = false;
    this.currentAngle = 0;
    this.keydownHandlerAttached = false;
  }

  init(options = {}) {
    if (options.items) {
      this.options = options.items.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  renderHTML(containerEl, isObsMode = false) {
    containerEl.innerHTML = `
      <div class="wheel-container" style="display: flex; flex-direction: column; align-items: center; position: relative;">
        <div class="wheel-pointer"></div>
        <canvas id="wheelCanvas" width="260" height="260" style="cursor: pointer; transition: transform 0.2s;" title="點擊轉盤即可旋轉"></canvas>
        <button id="btnSpinWheel" class="btn btn-sm btn-primary" style="margin-top: 0.8rem; box-shadow: 0 0 15px rgba(139,92,246,0.6);">
          🎡 開始旋轉抽獎 (點擊/按空白鍵)
        </button>
      </div>
    `;

    const canvas = containerEl.querySelector('#wheelCanvas');
    const spinBtn = containerEl.querySelector('#btnSpinWheel');

    if (canvas) {
      this.drawWheel(canvas);
      
      // Click canvas to spin
      canvas.onclick = () => this.spin(canvas, containerEl);
    }

    if (spinBtn) {
      spinBtn.onclick = () => this.spin(canvas, containerEl);
    }

    // Attach global keyboard listener (Space, Enter, S)
    if (!this.keydownHandlerAttached) {
      this.keydownHandlerAttached = true;
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          const activeCanvas = document.querySelector('#wheelCanvas');
          if (activeCanvas) {
            this.spin(activeCanvas, containerEl);
          }
        }
      });
    }
  }

  drawWheel(canvas) {
    const ctx = canvas.getContext('2d');
    const numOptions = this.options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numOptions; i++) {
      const angle = this.currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#090a0f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text labels
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.fillText(this.options[i], radius - 15, 4);
      ctx.restore();
    }

    // Draw center pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#090a0f';
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
  }

  spin(canvas, containerEl) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Play click sound using Web Audio API
    this.playClickSound();

    const extraDegree = Math.floor(Math.random() * 360) + 1800; // At least 5 full rotations
    const duration = 4500;
    const start = performance.now();
    const initialAngle = this.currentAngle;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.currentAngle = initialAngle + (extraDegree * Math.PI / 180) * easeOut;
      this.drawWheel(canvas);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.announceWinner(containerEl);
      }
    };

    requestAnimationFrame(animate);
  }

  announceWinner(containerEl) {
    const numOptions = this.options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    // Pointer is at top (3*PI/2)
    const normalizedAngle = (3 * Math.PI / 2 - (this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = Math.floor(normalizedAngle / arcSize);
    const winner = this.options[winningIndex] || this.options[0];

    // Fanfare Sound
    this.playWinnerSound();

    // Winner Toast Banner
    const resultToast = document.createElement('div');
    resultToast.className = 'toast';
    resultToast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); font-size: 1.2rem; padding: 1rem 2rem; background: rgba(18, 20, 32, 0.95); border: 2px solid #8b5cf6; border-radius: 12px; box-shadow: 0 0 30px rgba(139,92,246,0.8); z-index: 9999; text-align: center;';
    resultToast.innerHTML = `🎉 恭喜抽中：<strong style="color: #06b6d4;">${winner}</strong>`;
    document.body.appendChild(resultToast);

    setTimeout(() => resultToast.remove(), 5000);
  }

  playClickSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  }

  playWinnerSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.3, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + 0.8);
      });
    } catch(e) {}
  }
}
