/* Checklist Tool Class for Dashboard Modal Customizer */
export class ChecklistTool {
  constructor() {
    this.title = "主播備忘錄 & 待辦事項";
    this.itemsStr = "開播準備與招呼觀眾,1|乾爹工商講稿,0|主要遊戲實況,0|觀眾互動問答,0|下播預告,0";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.title = options.title || "主播備忘錄 & 待辦事項";
    this.itemsStr = options.items || "開播準備與招呼觀眾,1|乾爹工商講稿,0|主要遊戲實況,0|觀眾互動問答,0|下播預告,0";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTitle = encodeURIComponent(this.title);
    const encodedItems = encodeURIComponent(this.itemsStr);
    const iframeUrl = `checklist.html?title=${encodedTitle}&items=${encodedItems}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 220px; position: relative;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
