/* Webcam Tool Class for Dashboard Modal Customizer */
export class WebcamTool {
  constructor() {
    this.aspect = "16-9";
    this.tag = "🔴 LIVE";
    this.color = "#06b6d4";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.aspect = options.aspect || "16-9";
    this.tag = options.tag || options.title || "🔴 LIVE";
    this.color = options.color || "#06b6d4";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTag = encodeURIComponent(this.tag);
    const encodedColor = encodeURIComponent(this.color);
    const iframeUrl = `webcam.html?aspect=${this.aspect}&title=${encodedTag}&color=${encodedColor}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 180px; position: relative;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
