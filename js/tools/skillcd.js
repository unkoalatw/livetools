/* SkillCD Tool Class for Dashboard Modal Customizer */
export class SkillcdTool {
  constructor() {
    this.skills = "閃現,fa-bolt,300|大招,fa-explosion,90|傳送,fa-circle-nodes,240|治癒,fa-heart-pulse,180";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.skills = options.skills || "閃現,fa-bolt,300|大招,fa-explosion,90|傳送,fa-circle-nodes,240|治癒,fa-heart-pulse,180";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedSkills = encodeURIComponent(this.skills);
    const iframeUrl = `skillcd.html?skills=${encodedSkills}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 260px; position: relative; display: flex; justify-content: center; align-items: center;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
