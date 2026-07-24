/* BRB Tool Class for Dashboard Modal Customizer */
export class BrbTool {
  constructor() {
    this.title = "主播去拿水/上廁所，馬上回來！";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.title = options.title || "主播去拿水/上廁所，馬上回來！";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTitle = encodeURIComponent(this.title);
    const iframeUrl = `brb.html?title=${encodedTitle}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 260px; position: relative; display: flex; justify-content: center; align-items: center;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
