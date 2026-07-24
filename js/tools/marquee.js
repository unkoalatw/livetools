/* Marquee Ticker Tool Logic */
export class MarqueeTool {
  constructor() {
    this.text = "🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！";
    this.speed = 18;
    this.color = "#ec4899";
  }

  init(options = {}) {
    this.text = options.text || "🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！";
    this.speed = parseInt(options.speed || 18, 10);
    this.color = options.color || "#ec4899";
  }

  renderHTML(containerEl, isObsMode = false) {
    containerEl.innerHTML = `
      <div class="marquee-wrapper">
        <div class="marquee-content" style="animation-duration: ${this.speed}s; color: ${this.color};">
          ${this.text} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${this.text}
        </div>
      </div>
    `;
  }
}
