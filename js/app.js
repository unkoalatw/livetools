/* OBStools - Core Application Entry Point */
import { SVG_ICONS } from './icons.js';
import { TimerTool } from './tools/timer.js';
import { GoalTool } from './tools/goal.js';
import { MarqueeTool } from './tools/marquee.js';
import { WheelTool } from './tools/wheel.js';
import { SoundboardTool } from './tools/soundboard.js';
import { TimelineTool } from './tools/timeline.js';
import { ChecklistTool } from './tools/checklist.js';
import { StreakTool } from './tools/streak.js';
import { BrbTool } from './tools/brb.js';
import { WebcamTool } from './tools/webcam.js';
import { GameinfoTool } from './tools/gameinfo.js';

class App {
  constructor() {
    this.tools = {
      timer: new TimerTool(),
      goal: new GoalTool(),
      marquee: new MarqueeTool(),
      wheel: new WheelTool(),
      soundboard: new SoundboardTool(),
      timeline: new TimelineTool(),
      checklist: new ChecklistTool(),
      streak: new StreakTool(),
      brb: new BrbTool(),
      webcam: new WebcamTool(),
      gameinfo: new GameinfoTool(),
    };

    this.currentToolKey = null;
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const overlay = urlParams.get('overlay');

    if (overlay && this.tools[overlay]) {
      this.runObsMode(overlay, urlParams);
      return;
    }

    this.renderCardPreviews();
    this.setupEventListeners();
  }

  runObsMode(overlayKey, urlParams) {
    document.body.classList.add('obs-mode');
    document.getElementById('mainApp').style.display = 'none';
    
    const stage = document.getElementById('obsOverlayStage');
    stage.style.display = 'flex';

    const tool = this.tools[overlayKey];
    
    const options = {};
    for (const [key, value] of urlParams.entries()) {
      options[key] = value;
    }

    tool.init(options);
    tool.renderHTML(stage, true);
  }

  renderCardPreviews() {
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
    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolKey = e.currentTarget.getAttribute('data-tool');
        this.openModal(toolKey);
      });
    });

    const closeBtn = document.getElementById('btnCloseModal');
    const modalOverlay = document.getElementById('toolModal');
    
    closeBtn?.addEventListener('click', () => this.closeModal());
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) this.closeModal();
    });

    const guideBtn = document.getElementById('btnGuide');
    const guideModal = document.getElementById('guideModal');
    const closeGuideBtn = document.getElementById('btnCloseGuide');

    guideBtn?.addEventListener('click', () => guideModal.classList.add('active'));
    closeGuideBtn?.addEventListener('click', () => guideModal.classList.remove('active'));
    guideModal?.addEventListener('click', (e) => {
      if (e.target === guideModal) guideModal.classList.remove('active');
    });

    const copyBtn = document.getElementById('btnCopyObsUrl');
    copyBtn?.addEventListener('click', () => {
      const urlInput = document.getElementById('obsUrlInput');
      if (urlInput && urlInput.value) {
        navigator.clipboard.writeText(urlInput.value).then(() => {
          this.showToast('OBS 網址已複製到剪貼簿！');
        }).catch(() => {
          urlInput.select();
          document.execCommand('copy');
          this.showToast('OBS 網址已複製到剪貼簿！');
        });
      }
    });

    const filterBtns = document.querySelectorAll('.filter-tabs .tab-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const cat = e.currentTarget.getAttribute('data-category');
        this.filterTools(cat, document.getElementById('searchInput').value);
      });
    });

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

    const toolMeta = {
      timer: { title: '倒數計時器設定', icon: SVG_ICONS.timer },
      goal: { title: '目標進度條設定', icon: SVG_ICONS.target },
      marquee: { title: '跑馬燈公告欄設定', icon: SVG_ICONS.megaphone },
      wheel: { title: '抽獎決策轉盤設定', icon: SVG_ICONS.wheel },
      soundboard: { title: '直播音效控制器', icon: SVG_ICONS.soundboard },
      timeline: { title: '直播時間軸流程設定', icon: SVG_ICONS.hourglass },
      checklist: { title: '主播即時備忘錄設定', icon: SVG_ICONS.checklist },
      streak: { title: '勝負戰績與連勝計數器設定', icon: SVG_ICONS.trophy },
      brb: { title: '暫離 / 休息中預告卡設定', icon: SVG_ICONS.coffee },
      webcam: { title: '視訊鏡頭霓虹相框設定', icon: SVG_ICONS.webcam },
      gameinfo: { title: '遊戲資訊即時展示卡設定', icon: SVG_ICONS.gamepad },
    };

    const meta = toolMeta[toolKey] || { title: '工具設定', icon: SVG_ICONS.gear };
    if (modalTitle) modalTitle.textContent = meta.title;
    if (modalIcon) modalIcon.innerHTML = meta.icon;

    this.renderFormFields(toolKey, formFields);
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
          <input type="text" id="cfgText" class="form-control" value="歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 聊天室請保持禮貌 | 訂閱解鎖限定貼圖！">
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
    } else if (toolKey === 'timeline') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>時間軸階段列表 (格式: 階段名稱,分鐘|階段名稱,分鐘)</label>
          <input type="text" id="cfgEvents" class="form-control" value="開播準備與雜談,15|主要遊戲實況,45|觀眾互動 QA,20|特別活動,15|晚安下播,10">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>跑馬燈公告內容</label>
          <input type="text" id="cfgMarqueeText" class="form-control" value="歡迎來到直播間！點擊追蹤開啟小鈴鐺 | 聊天室請保持禮貌 | 訂閱解鎖限定貼圖！">
        </div>
        <div class="form-group">
          <label>預設顯示內容</label>
          <select id="cfgView" class="form-control">
            <option value="timeline">時間軸模式 (按 M 切換跑馬燈)</option>
            <option value="marquee">跑馬燈模式 (按 M 切換時間軸)</option>
          </select>
        </div>
        <div class="form-group">
          <label>倒數進行模式</label>
          <select id="cfgMode" class="form-control">
            <option value="auto">自動進行 (依分鐘數自動切換)</option>
            <option value="manual">手動觸發 (控制台/快捷鍵切換)</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    } else if (toolKey === 'checklist') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>備忘錄標題</label>
          <input type="text" id="cfgChecklistTitle" class="form-control" value="主播備忘錄 & 待辦事項">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>備忘事項列表 (格式: 事項名稱,0或1完成狀態)</label>
          <input type="text" id="cfgChecklistItems" class="form-control" value="開播準備與招呼觀眾,1|乾爹工商講稿,0|主要遊戲實況,0|觀眾互動問答,0|下播預告,0">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    } else if (toolKey === 'streak') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>戰績標題</label>
          <input type="text" id="cfgStreakTitle" class="form-control" value="今日遊戲戰績">
        </div>
        <div class="form-group">
          <label>初始勝場</label>
          <input type="number" id="cfgWins" class="form-control" value="0">
        </div>
        <div class="form-group">
          <label>初始敗場</label>
          <input type="number" id="cfgLosses" class="form-control" value="0">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    } else if (toolKey === 'brb') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>暫離預告標題文字</label>
          <input type="text" id="cfgBrbTitle" class="form-control" value="主播去拿水/上廁所，馬上回來！">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    } else if (toolKey === 'webcam') {
      container.innerHTML = `
        <div class="form-group">
          <label>標籤銘牌文字</label>
          <input type="text" id="cfgWebcamTag" class="form-control" value="LIVE">
        </div>
        <div class="form-group">
          <label>相框型態與比例</label>
          <select id="cfgWebcamAspect" class="form-control">
            <option value="16-9">16 : 9 寬螢幕框</option>
            <option value="4-3">4 : 3 方框</option>
            <option value="circle">圓形外框</option>
          </select>
        </div>
        <div class="form-group">
          <label>霓虹邊框顏色</label>
          <input type="color" id="cfgWebcamColor" class="form-control" value="#06b6d4" style="height: 40px; padding: 2px;">
        </div>
        <div class="form-group">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    } else if (toolKey === 'gameinfo') {
      container.innerHTML = `
        <div class="form-group" style="grid-column: span 2;">
          <label>遊戲名稱 (輸入或搜尋)</label>
          <input type="text" id="cfgGameTitle" class="form-control" value="黑神話：悟空 (Black Myth: Wukong)">
        </div>
        <div class="form-group">
          <label>開發團隊 / 發行商</label>
          <input type="text" id="cfgGameDev" class="form-control" value="Game Science (遊戲科學)">
        </div>
        <div class="form-group">
          <label>遊戲類型標籤</label>
          <input type="text" id="cfgGameGenre" class="form-control" value="動作 RPG">
        </div>
        <div class="form-group">
          <label>評分 (0 ~ 10)</label>
          <input type="text" id="cfgGameRating" class="form-control" value="9.5">
        </div>
        <div class="form-group">
          <label>價格 / 狀態</label>
          <input type="text" id="cfgGamePrice" class="form-control" value="NT$ 1,280">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>封面圖片網址 (Cover Image URL)</label>
          <input type="text" id="cfgGameCover" class="form-control" value="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80">
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label>OBS 控制台按鈕顯示</label>
          <select id="cfgHideBtn" class="form-control">
            <option value="false">顯示控制台按鈕</option>
            <option value="true">預設隱藏 (按 H 可再呼出)</option>
          </select>
        </div>
      `;
    }

    container.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => this.updateModalState());
      input.addEventListener('change', () => this.updateModalState());
    });
  }

  updateModalState() {
    const toolKey = this.currentToolKey;
    if (!toolKey) return;

    const tool = this.tools[toolKey];
    const stageContent = document.getElementById('modalStageContent');
    const obsUrlInput = document.getElementById('obsUrlInput');

    let finalUrl = "";
    const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

    if (toolKey === 'timeline') {
      const cfgEvents = document.getElementById('cfgEvents');
      const cfgMarqueeText = document.getElementById('cfgMarqueeText');
      const cfgView = document.getElementById('cfgView');
      const cfgMode = document.getElementById('cfgMode');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const eventsVal = cfgEvents ? cfgEvents.value : "開播準備與雜談,15|主要遊戲實況,45";
      const marqueeVal = cfgMarqueeText ? cfgMarqueeText.value : "歡迎來到直播間！";
      const viewVal = cfgView ? cfgView.value : "timeline";
      const modeVal = cfgMode ? cfgMode.value : "auto";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ events: eventsVal, marquee: marqueeVal, view: viewVal, mode: modeVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}timeline.html?events=${encodeURIComponent(eventsVal)}&marquee=${encodeURIComponent(marqueeVal)}&view=${viewVal}&mode=${modeVal}&hidebtn=${hideBtnVal}`;
    } else if (toolKey === 'checklist') {
      const cfgChecklistTitle = document.getElementById('cfgChecklistTitle');
      const cfgChecklistItems = document.getElementById('cfgChecklistItems');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const titleVal = cfgChecklistTitle ? cfgChecklistTitle.value : "主播備忘錄 & 待辦事項";
      const itemsVal = cfgChecklistItems ? cfgChecklistItems.value : "開播準備,1|工商講稿,0";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ title: titleVal, items: itemsVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}checklist.html?title=${encodeURIComponent(titleVal)}&items=${encodeURIComponent(itemsVal)}&hidebtn=${hideBtnVal}`;
    } else if (toolKey === 'streak') {
      const cfgStreakTitle = document.getElementById('cfgStreakTitle');
      const cfgWins = document.getElementById('cfgWins');
      const cfgLosses = document.getElementById('cfgLosses');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const titleVal = cfgStreakTitle ? cfgStreakTitle.value : "今日遊戲戰績";
      const winsVal = cfgWins ? cfgWins.value : "0";
      const lossesVal = cfgLosses ? cfgLosses.value : "0";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ title: titleVal, wins: winsVal, losses: lossesVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}streak.html?title=${encodeURIComponent(titleVal)}&wins=${winsVal}&losses=${lossesVal}&hidebtn=${hideBtnVal}`;
    } else if (toolKey === 'brb') {
      const cfgBrbTitle = document.getElementById('cfgBrbTitle');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const titleVal = cfgBrbTitle ? cfgBrbTitle.value : "主播馬上回來！";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ title: titleVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}brb.html?title=${encodeURIComponent(titleVal)}&hidebtn=${hideBtnVal}`;
    } else if (toolKey === 'webcam') {
      const cfgWebcamTag = document.getElementById('cfgWebcamTag');
      const cfgWebcamAspect = document.getElementById('cfgWebcamAspect');
      const cfgWebcamColor = document.getElementById('cfgWebcamColor');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const tagVal = cfgWebcamTag ? cfgWebcamTag.value : "LIVE";
      const aspectVal = cfgWebcamAspect ? cfgWebcamAspect.value : "16-9";
      const colorVal = cfgWebcamColor ? cfgWebcamColor.value : "#06b6d4";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ tag: tagVal, aspect: aspectVal, color: colorVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}webcam.html?aspect=${aspectVal}&title=${encodeURIComponent(tagVal)}&color=${encodeURIComponent(colorVal)}&hidebtn=${hideBtnVal}`;
    } else if (toolKey === 'gameinfo') {
      const cfgGameTitle = document.getElementById('cfgGameTitle');
      const cfgGameDev = document.getElementById('cfgGameDev');
      const cfgGameGenre = document.getElementById('cfgGameGenre');
      const cfgGameRating = document.getElementById('cfgGameRating');
      const cfgGamePrice = document.getElementById('cfgGamePrice');
      const cfgGameCover = document.getElementById('cfgGameCover');
      const cfgHideBtn = document.getElementById('cfgHideBtn');

      const titleVal = cfgGameTitle ? cfgGameTitle.value : "黑神話：悟空 (Black Myth: Wukong)";
      const devVal = cfgGameDev ? cfgGameDev.value : "Game Science (遊戲科學)";
      const genreVal = cfgGameGenre ? cfgGameGenre.value : "動作 RPG";
      const ratingVal = cfgGameRating ? cfgGameRating.value : "9.5";
      const priceVal = cfgGamePrice ? cfgGamePrice.value : "NT$ 1,280";
      const coverVal = cfgGameCover ? cfgGameCover.value : "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80";
      const hideBtnVal = cfgHideBtn ? cfgHideBtn.value : "false";

      tool.init({ title: titleVal, dev: devVal, genre: genreVal, rating: ratingVal, price: priceVal, cover: coverVal, hidebtn: hideBtnVal });
      if (stageContent) tool.renderHTML(stageContent, false);
      finalUrl = `${basePath}gameinfo.html?title=${encodeURIComponent(titleVal)}&dev=${encodeURIComponent(devVal)}&genre=${encodeURIComponent(genreVal)}&rating=${encodeURIComponent(ratingVal)}&price=${encodeURIComponent(priceVal)}&cover=${encodeURIComponent(coverVal)}&hidebtn=${hideBtnVal}`;
    } else {
      const params = new URLSearchParams();
      params.set('overlay', toolKey);

      const options = {};

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

      tool.init(options);
      if (stageContent) tool.renderHTML(stageContent, false);

      const currentBaseUrl = window.location.origin + window.location.pathname;
      finalUrl = `${currentBaseUrl}?${params.toString()}`;
    }

    if (obsUrlInput) {
      obsUrlInput.value = finalUrl;
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color:#10b981;">✓</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
