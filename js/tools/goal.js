/* Goal Bar Tool Logic */
export class GoalTool {
  constructor() {
    this.title = "NEW SUBSCRIBERS GOAL";
    this.current = 75;
    this.target = 100;
    this.color = "#8b5cf6";
  }

  init(options = {}) {
    this.title = options.title || "NEW SUBSCRIBERS GOAL";
    this.current = parseInt(options.current || 75, 10);
    this.target = parseInt(options.target || 100, 10);
    this.color = options.color || "#8b5cf6";
  }

  renderHTML(containerEl, isObsMode = false) {
    const percent = Math.min(Math.round((this.current / (this.target || 1)) * 100), 100);
    
    containerEl.innerHTML = `
      <div class="goal-container">
        <div class="goal-header-text">
          <span>🎯 ${this.title}</span>
          <span style="color: ${this.color};">${this.current} / ${this.target} (${percent}%)</span>
        </div>
        <div class="goal-track">
          <div class="goal-fill" style="width: ${percent}%; background: linear-gradient(90deg, ${this.color}, #06b6d4); box-shadow: 0 0 12px ${this.color}aa;"></div>
        </div>
        ${!isObsMode ? `
          <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button id="btnGoalSub" class="btn btn-sm btn-secondary">-1</button>
            <button id="btnGoalAdd" class="btn btn-sm btn-primary">+1 追蹤/訂閱</button>
            <button id="btnGoalAdd5" class="btn btn-sm btn-accent">+5</button>
          </div>
        ` : ''}
      </div>
    `;

    if (!isObsMode) {
      this.attachControls(containerEl);
    }
  }

  attachControls(containerEl) {
    const subBtn = containerEl.querySelector('#btnGoalSub');
    const addBtn = containerEl.querySelector('#btnGoalAdd');
    const add5Btn = containerEl.querySelector('#btnGoalAdd5');

    subBtn?.addEventListener('click', () => {
      this.current = Math.max(0, this.current - 1);
      this.renderHTML(containerEl, false);
    });

    addBtn?.addEventListener('click', () => {
      this.current = this.current + 1;
      this.renderHTML(containerEl, false);
    });

    add5Btn?.addEventListener('click', () => {
      this.current = this.current + 5;
      this.renderHTML(containerEl, false);
    });
  }
}
