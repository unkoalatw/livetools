// State Variables for Webcam Frame Overlay
let webcamAspect = "16-9"; // '16-9', '4-3', 'circle'
let webcamTag = "🔴 LIVE";
let webcamColor = "#06b6d4";

function loadWebcamFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const aspectParam = urlParams.get('aspect');
  const tagParam = urlParams.get('title') || urlParams.get('tag');
  const colorParam = urlParams.get('color');

  if (aspectParam) webcamAspect = aspectParam;
  if (tagParam) webcamTag = decodeURIComponent(tagParam);
  if (colorParam) webcamColor = colorParam;
}

loadWebcamFromSource();

function renderWebcamFrame() {
  const frameEl = document.getElementById('webcam-frame-el');
  const tagEl = document.getElementById('webcam-tag-el');

  if (frameEl) {
    frameEl.className = `webcam-frame aspect-${webcamAspect}`;
    frameEl.style.borderColor = webcamColor;
    frameEl.style.boxShadow = `0 0 25px ${webcamColor}99, inset 0 0 15px ${webcamColor}44`;
  }

  if (tagEl) {
    tagEl.textContent = webcamTag;
  }
}

function setAspect(aspect) {
  webcamAspect = aspect;
  renderWebcamFrame();
}

function toggleControlPanel() {
  const content = document.getElementById('panel-content');
  content?.classList.toggle('hidden');
}

function hideWholeControlPanel() {
  const panel = document.getElementById('control-panel');
  panel?.classList.add('hidden');
}

function toggleWholeControlPanel() {
  const panel = document.getElementById('control-panel');
  panel?.classList.toggle('hidden');
}

// Keyboard Hotkeys Support (H: toggle panel)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  }
});

window.onload = function() {
  renderWebcamFrame();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
