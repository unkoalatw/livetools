/* Timeline Tool Class for Dashboard Modal Customizer */
export class TimelineTool {
  constructor() {
    this.eventsStr = "開播準備與雜談,15|主要遊戲實況,45|觀眾互動 QA,20|特別活動,15|晚安下播,10";
    this.mode = "auto";
    this.view = "timeline";
    this.marqueeText = "🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.eventsStr = options.events || "開播準備與雜談,15|主要遊戲實況,45|觀眾互動 QA,20|特別活動,15|晚安下播,10";
    this.mode = options.mode || "auto";
    this.view = options.view || "timeline";
    this.marqueeText = options.marquee || "🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedEvents = encodeURIComponent(this.eventsStr);
    const encodedMarquee = encodeURIComponent(this.marqueeText);
    const iframeUrl = `timeline.html?events=${encodedEvents}&mode=${this.mode}&view=${this.view}&marquee=${encodedMarquee}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 260px; position: relative; display: flex; justify-content: center; align-items: center;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
