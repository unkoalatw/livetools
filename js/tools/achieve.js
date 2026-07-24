/* AchieveTool Class for Dashboard Modal Customizer */
export class AchieveTool {
  constructor() {
    this.title = "首次單場 20 殺！";
    this.desc = "你已解鎖這個史詩成就";
    this.duration = "5";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.title = options.title || "首次單場 20 殺！";
    this.desc = options.desc || "你已解鎖這個史詩成就";
    this.duration = options.duration || "5";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTitle = encodeURIComponent(this.title);
    const encodedDesc = encodeURIComponent(this.desc);
    const iframeUrl = `achieve.html?title=${encodedTitle}&desc=${encodedDesc}&duration=${this.duration}&autoplay=true&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 260px; position: relative; display: flex; justify-content: center; align-items: center;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
