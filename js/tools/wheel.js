/* Raffle / Decision Wheel Tool Logic */
export class WheelTool {
  constructor() {
    this.options = ["VIP 贈送", "懲罰遊戲", "加時 15 分鐘", "觀眾指定英雄", "再抽一次", "送點數卡"];
    this.colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];
    this.isSpinning = false;
    this.currentAngle = 0;
  }

  init(options = {}) {
    if (options.items) {
      this.options = options.items.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  renderHTML(containerEl, isObsMode = false) {
    containerEl.innerHTML = `
      <div class="wheel-container">
        <div class="wheel-pointer"></div>
        <canvas id="wheelCanvas" width="220" height="220"></canvas>
        ${!isObsMode ? `
          <button id="btnSpinWheel" class="btn btn-sm btn-primary" style="margin-top: 0.8rem;">🎡 開始旋轉抽獎</button>
        ` : ''}
      </div>
    `;

    const canvas = containerEl.querySelector('#wheelCanvas');
    if (canvas) {
      this.drawWheel(canvas);
    }

    if (!isObsMode) {
      const spinBtn = containerEl.querySelector('#btnSpinWheel');
      spinBtn?.addEventListener('click', () => this.spin(canvas, containerEl));
    }
  }

  drawWheel(canvas) {
    const ctx = canvas.getContext('2d');
    const numOptions = this.options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 5;

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
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillText(this.options[i], radius - 15, 4);
      ctx.restore();
    }
  }

  spin(canvas, containerEl) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const extraDegree = Math.floor(Math.random() * 360) + 1440; // At least 4 full rotations
    const duration = 4000;
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

    const resultToast = document.createElement('div');
    resultToast.className = 'toast';
    resultToast.innerHTML = `🎉 抽中結果：<span style="color: #06b6d4;">${winner}</span>`;
    document.body.appendChild(resultToast);

    setTimeout(() => resultToast.remove(), 4000);
  }
}
