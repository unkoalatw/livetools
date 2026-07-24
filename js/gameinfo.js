// Preset Game Database for Instant Search
const PRESET_GAMES = {
  "黑神話：悟空": {
    title: "黑神話：悟空 (Black Myth: Wukong)",
    developer: "Game Science (遊戲科學)",
    genre: "動作 RPG, 西遊記",
    rating: "9.5",
    price: "NT$ 1,280",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"
  },
  "艾爾登法環": {
    title: "艾爾登法環 (Elden Ring)",
    developer: "FromSoftware / Bandai Namco",
    genre: "開放世界, 魂系 ARPG",
    rating: "9.8",
    price: "NT$ 1,790",
    cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80"
  },
  "monster hunter": {
    title: "Monster Hunter Wilds (魔物獵人 荒野)",
    developer: "CAPCOM (卡普空)",
    genre: "動作冒險, 狩獵共鬥",
    rating: "9.3",
    price: "NT$ 1,990",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80"
  },
  "cyberpunk 2077": {
    title: "Cyberpunk 2077 (電馭叛客 2077)",
    developer: "CD PROJEKT RED",
    genre: "賽博朋克, 第一人稱 RPG",
    rating: "9.0",
    price: "NT$ 1,599",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80"
  },
  "gta v": {
    title: "Grand Theft Auto V (俠盜獵車手 5)",
    developer: "Rockstar Games",
    genre: "開放世界, 動作犯罪",
    rating: "9.7",
    price: "NT$ 990",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80"
  },
  "apex legends": {
    title: "Apex Legends (Apex 英雄)",
    developer: "Respawn / EA",
    genre: "戰術競技, 英雄射擊",
    rating: "8.9",
    price: "免費遊玩 (Free)",
    cover: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&q=80"
  },
  "valorant": {
    title: "VALORANT (特戰英豪)",
    developer: "Riot Games (拳頭遊戲)",
    genre: "戰術射擊, 第一人稱",
    rating: "8.8",
    price: "免費遊玩 (Free)",
    cover: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&q=80"
  }
};

// Default State
let gameData = {
  title: "黑神話：悟空 (Black Myth: Wukong)",
  developer: "Game Science (遊戲科學)",
  genre: "動作 RPG, 奇幻",
  rating: "9.5",
  price: "NT$ 1,280",
  cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"
};

let isCardVisible = true;

// Truncate helper to ensure text strictly fits within limits
function truncateText(str, maxLength) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

function loadGameInfoFromSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const titleParam = urlParams.get('title');
  const devParam = urlParams.get('dev') || urlParams.get('developer');
  const genreParam = urlParams.get('genre');
  const ratingParam = urlParams.get('rating');
  const priceParam = urlParams.get('price');
  const coverParam = urlParams.get('cover');

  if (titleParam) gameData.title = decodeURIComponent(titleParam);
  if (devParam) gameData.developer = decodeURIComponent(devParam);
  if (genreParam) gameData.genre = decodeURIComponent(genreParam);
  if (ratingParam) gameData.rating = decodeURIComponent(ratingParam);
  if (priceParam) gameData.price = decodeURIComponent(priceParam);
  if (coverParam) gameData.cover = decodeURIComponent(coverParam);
}

loadGameInfoFromSource();

function renderGameCard() {
  const titleEl = document.getElementById('game-title-el');
  const devEl = document.getElementById('game-dev-el');
  const genreEl = document.getElementById('game-genre-el');
  const ratingEl = document.getElementById('game-rating-el');
  const priceEl = document.getElementById('game-price-el');
  const coverEl = document.getElementById('game-cover-img');

  if (titleEl) titleEl.textContent = truncateText(gameData.title, 35);
  if (devEl) devEl.textContent = truncateText(gameData.developer, 30);
  if (genreEl) genreEl.textContent = truncateText(gameData.genre, 25);
  if (ratingEl) ratingEl.textContent = gameData.rating || "9.0";
  if (priceEl) priceEl.textContent = gameData.price || "Free";
  if (coverEl && gameData.cover) coverEl.src = gameData.cover;
}

async function searchGameInfo(query) {
  if (!query) return;
  const q = query.toLowerCase().trim();

  // 1. Check Presets first
  for (const [key, data] of Object.entries(PRESET_GAMES)) {
    if (key.toLowerCase().includes(q) || data.title.toLowerCase().includes(q)) {
      gameData = { ...data };
      renderGameCard();
      showToastNotification(`已成功抓取遊戲資訊：${truncateText(data.title, 20)}`);
      return;
    }
  }

  // 2. Fetch live from RAWG Public Game API if not preset
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=d4957e0340384f9382ed0a80e14c1143&search=${encodeURIComponent(query)}&page_size=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const game = data.results[0];
        gameData = {
          title: truncateText(game.name, 35),
          developer: game.developers ? game.developers.map(d => d.name).join(', ') : (game.publishers ? game.publishers.map(p => p.name).join(', ') : "RAWG Games"),
          genre: game.genres ? game.genres.slice(0, 2).map(g => g.name).join(', ') : "Action",
          rating: game.rating ? (game.rating * 2).toFixed(1) : "9.0",
          price: "熱門發售中",
          cover: game.background_image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"
        };
        renderGameCard();
        showToastNotification(`已抓取網絡遊戲資訊：${truncateText(game.name, 20)}`);
        return;
      }
    }
  } catch (err) {
    console.warn("RAWG fetch error:", err);
  }

  // Fallback if query not found
  gameData.title = truncateText(query, 35);
  renderGameCard();
}

function toggleGameCard() {
  isCardVisible = !isCardVisible;
  const card = document.getElementById('game-card-el');
  const btnToggle = document.getElementById('btn-toggle-game');

  if (card) {
    if (isCardVisible) {
      card.classList.remove('hidden-overlay');
    } else {
      card.classList.add('hidden-overlay');
    }
  }

  if (btnToggle) {
    btnToggle.innerHTML = isCardVisible
      ? '<i class="fa-solid fa-eye-slash mr-1"></i> 淡出關閉卡片 (G)'
      : '<i class="fa-solid fa-eye mr-1"></i> 顯示卡片 (G)';
  }
}

function showToastNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-2 rounded-lg shadow-xl z-50 transition-all';
  toast.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
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

// Keyboard Hotkeys Support (G: toggle card, H: toggle panel)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'h' || e.key === 'H') {
    toggleWholeControlPanel();
  } else if (e.key === 'g' || e.key === 'G') {
    toggleGameCard();
  }
});

window.onload = function() {
  renderGameCard();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hidebtn') === 'true' || urlParams.get('controls') === 'false') {
    hideWholeControlPanel();
  }
};
