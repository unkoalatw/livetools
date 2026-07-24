/* Timeline Tool Class for Dashboard Modal Customizer */
export class TimelineTool {
  constructor() {
    this.eventsStr = "開播準備與雜談,15|主要遊戲實況,45|觀眾互動 QA,20|特別活動,15|晚安下播,10";
    this.mode = "auto";
  }

  init(options = {}) {
    this.eventsStr = options.events || "開播準備與雜談,15|主要遊戲實況,45|觀眾互動 QA,20|特別活動,15|晚安下播,10";
    this.mode = options.mode || "auto";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedEvents = encodeURIComponent(this.eventsStr);
    const iframeUrl = `timeline.html?events=${encodedEvents}&mode=${this.mode}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 180px; position: relative;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
