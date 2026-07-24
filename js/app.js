/* OBStools - Core Application Entry Point */
import { TimerTool } from './tools/timer.js';
import { GoalTool } from './tools/goal.js';
import { MarqueeTool } from './tools/marquee.js';
import { WheelTool } from './tools/wheel.js';
import { SoundboardTool } from './tools/soundboard.js';

class App {
  constructor() {
    this.tools = {
      timer: new TimerTool(),
      goal: new GoalTool(),
      marquee: new MarqueeTool(),
      wheel: new WheelTool(),
      soundboard: new SoundboardTool(),
    };

    this.currentToolKey = null;
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const overlay = urlParams.get('overlay');

    // If 'overlay' parameter exists, run in OBS standalone transparent mode!
    if (overlay && this.tools[overlay]) {
      this.runObsMode(overlay, urlParams);
      return;
    }

    // Normal website interactive mode
    this.renderCardPreviews();
    this.setupEventListeners();
  }

  runObsMode(overlayKey, urlParams) {
    document.body.classList.add('obs-mode');
    document.getElementById('mainApp').style.display = 'none';
    
    const stage = document.getElementById('obsOverlayStage');
    stage.style.display = 'flex';

    const tool = this.tools[overlayKey];
    
    // Convert urlParams to options object
    const options = {};
    for (const [key, value] of urlParams.entries()) {
      options[key] = value;
    }

    tool.init(options);
    tool.renderHTML(stage, true);
  }

  renderCardPreviews() {
    // Render static live previews inside card preview boxes
    const timerCard = document.getElementById('previewTimerCard');
    if (timerCard) this.tools.timer.renderHTML(timerCard, false);

    const goalCard = document.getElementById('previewGoalCard');
    if (goalCard) this.tools.goal.renderHTML(goalCard, false);

    const marqueeCard = document.getElementById('previewMarqueeCard');
    if (marqueeCard) this.tools.marquee.renderHTML(marqueeCard, false);

    const wheelCard = document.getElementById('previewWheelCard');
    if (wheelCard) this.tools.wheel.renderHTML(wheelCard, false);

    const soundboardCard = document.getElementById('previewSoundboardCard');
    if (soundboardCard) this.tools.soundboard.renderHTML(soundboardCard, false);
  }

  setupEventListeners() {
    // Open modal event
    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolKey = e.currentTarget.getAttribute('data-tool');
        this.openModal(toolKey);
      });
    });

    // Close modal
    const closeBtn = document.getElementById('btnCloseModal');
    const modalOverlay = document.getElementById('toolModal');
    
    closeBtn?.addEventListener('click', () => this.closeModal());
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) this.closeModal();
    });

    // Tutorial Guide modal
    const guideBtn = document.getElementById('btnGuide');
    const guideModal = document.getElementById('guideModal');
    const closeGuideBtn = document.getElementById('btnCloseGuide');

    guideBtn?.addEventListener('click', () => guideModal.classList.add('active'));
    closeGuideBtn?.addEventListener('click', () => guideModal.classList.remove('active'));
    guideModal?.addEventListener('click', (e) => {
      if (e.target === guideModal) guideModal.classList.remove('active');
    });

    // Copy OBS URL button
    const copyBtn = document.getElementById('btnCopyObsUrl');
    copyBtn?.addEventListener('click', () => {
      const urlInput = document.getElementById('obsUrlInput');
      if (urlInput && urlInput.value) {
        navigator.clipboard.writeText(urlInput.value).then(() => {
          this.showToast('✅ OBS 網址已複製到剪貼簿！');
        }).catch(() => {
          urlInput.select();
          document.execCommand('copy');
          this.showToast('✅ OBS 網址已複製到剪貼簿！');
        });
      }
    });

    // Category Filter tabs
    const filterBtns = document.querySelectorAll('.filter-tabs .tab-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const cat = e.currentTarget.getAttribute('data-category');
        this.filterTools(cat, document.getElementById('searchInput').value);
      });
    });

    // Search Input
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => {
      const activeTab = document.querySelector('.filter-tabs .tab-btn.active');
      const cat = activeTab ? activeTab.getAttribute('data-category') : 'all';
      this.filterTools(cat, e.target.value);
    });
  }

  filterTools(category, query) {
    const cards = document.querySelectorAll('.tool-card');
    const q = (query || '').toLowerCase().trim();

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const titleText = card.querySelector('h3')?.textContent.toLowerCase() || '';

      const matchesCat = category === 'all' || cardCat === category;
      const matchesSearch = !q || keywords.includes(q) || titleText.includes(q);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  openModal(toolKey) {
    this.currentToolKey = toolKey;
    const modal = document.getElementById('toolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const formFields = document.getElementById('modalFormFields');

    const titles = {
      timer: '⏱️ 倒數計時器設定',
      goal: '🎯 目標進度條設定',
      marquee: '📢 跑馬燈公告欄設定',
      wheel: '🎡 抽獎決策轉盤設定',
      soundboard: '🔊 直播音效控制器',
    };

    if (modalTitle) modalTitle.textContent = titles[toolKey] || '工具設定';
    
    // Build Dynamic Form Fields based on tool
    this.renderFormFields(toolKey, formFields);

    // Update Live Preview and OBS URL
    this.updateModalState();

    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('toolModal');
    modal.classList.remove('active');
  }

  renderFormFields(toolKey, container) {
    container.innerHTML = '';

    if (toolKey === 'timer') {
      container.innerHTML = `
        <div class="form-group">
          <label>標題文字</label>
          <input type="text" id="cfgTitle" class="form-control" value="STREAM COUNTDOWN">
        </div>
        <div class="form-group">
          <label>倒數時間 (分鐘)</label>
          <input type="number" id="cfgMinutes" class="form-control" value="10" min="1" max="180">
        </div>
        <div class="form-group">
          <label>數字顏色</label>
          <input type="color" id="cfgColor" class="form-control" value="#06b6d4" style="height: 40px; padding: 2px;">
        </div>
      `;
    } else if (toolKey === 'goal') {
      container.innerHTML = `
        <div class="form-group">
          <label>目標標題</label>
          <input type="text" id="cfgTitle" class="form-control" value="NEW SUBSCRIBERS GOAL">
        </div>
        <div class="form-group">
          <label>目前數量</label>
          <input type="number" id="cfgCurrent" class="form-control" value="75">
        </div>
        <div class="form-group">
          <label>目標總量</label>
          <input type="number" id="cfgTarget" class="form-control" value="100">
        </div>
        <div class="form-group">
          <label>進度條主題色</label>
          <input type="color" id="cfgColor" class="form-control" value="#8b5cf6" style="height: 40px; padding: 2px;">
        </div>
      `;
    } else if (toolKey === 'marquee') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>公告內容 (可用 | 分隔多段內容)</label>
          <input type="text" id="cfgText" class="form-control" value="🔥 歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 💬 聊天室請保持禮貌 | 🎁 訂閱解鎖限定貼圖！">
        </div>
        <div class="form-group">
          <label>滾動速度 (秒/輪)</label>
          <input type="number" id="cfgSpeed" class="form-control" value="18" min="5" max="60">
        </div>
        <div class="form-group">
          <label>文字顏色</label>
          <input type="color" id="cfgColor" class="form-control" value="#ec4899" style="height: 40px; padding: 2px;">
        </div>
      `;
    } else if (toolKey === 'wheel') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>轉盤選項 (逗點分隔)</label>
          <input type="text" id="cfgItems" class="form-control" value="VIP 贈送, 懲罰遊戲, 加時 15 分鐘, 觀眾指定英雄, 再抽一次, 送點數卡">
        </div>
      `;
    } else if (toolKey === 'soundboard') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            音效板可直接在視窗或直播時點擊觸發。音效網址支援貼入 OBS 當作視窗來源。
          </p>
        </div>
      `;
    }

    // Attach real-time input change listeners
    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.updateModalState());
    });
  }

  updateModalState() {
    const toolKey = this.currentToolKey;
    if (!toolKey) return;

    const tool = this.tools[toolKey];
    const stageContent = document.getElementById('modalStageContent');
    const obsUrlInput = document.getElementById('obsUrlInput');

    const params = new URLSearchParams();
    params.set('overlay', toolKey);

    const options = {};

    // Gather input values
    const cfgTitle = document.getElementById('cfgTitle');
    const cfgMinutes = document.getElementById('cfgMinutes');
    const cfgCurrent = document.getElementById('cfgCurrent');
    const cfgTarget = document.getElementById('cfgTarget');
    const cfgText = document.getElementById('cfgText');
    const cfgSpeed = document.getElementById('cfgSpeed');
    const cfgItems = document.getElementById('cfgItems');
    const cfgColor = document.getElementById('cfgColor');

    if (cfgTitle) { options.title = cfgTitle.value; params.set('title', cfgTitle.value); }
    if (cfgMinutes) { options.minutes = cfgMinutes.value; params.set('minutes', cfgMinutes.value); }
    if (cfgCurrent) { options.current = cfgCurrent.value; params.set('current', cfgCurrent.value); }
    if (cfgTarget) { options.target = cfgTarget.value; params.set('target', cfgTarget.value); }
    if (cfgText) { options.text = cfgText.value; params.set('text', cfgText.value); }
    if (cfgSpeed) { options.speed = cfgSpeed.value; params.set('speed', cfgSpeed.value); }
    if (cfgItems) { options.items = cfgItems.value; params.set('items', cfgItems.value); }
    if (cfgColor) { options.color = cfgColor.value; params.set('color', cfgColor.value); }

    // Re-init tool and render to preview stage
    tool.init(options);
    if (stageContent) {
      tool.renderHTML(stageContent, false);
    }

    // Construct clean URL
    const currentBaseUrl = window.location.origin + window.location.pathname;
    const finalUrl = `${currentBaseUrl}?${params.toString()}`;
    if (obsUrlInput) {
      obsUrlInput.value = finalUrl;
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Start App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
