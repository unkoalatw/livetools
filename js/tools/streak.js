/* Streak Tool Class for Dashboard Modal Customizer */
export class StreakTool {
  constructor() {
    this.title = "今日遊戲戰績";
    this.wins = 0;
    this.losses = 0;
    this.streak = 0;
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.title = options.title || "今日遊戲戰績";
    this.wins = options.wins || 0;
    this.losses = options.losses || 0;
    this.streak = options.streak || 0;
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTitle = encodeURIComponent(this.title);
    const iframeUrl = `streak.html?title=${encodedTitle}&wins=${this.wins}&losses=${this.losses}&streak=${this.streak}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 160px; position: relative;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
