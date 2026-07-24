/* GameInfo Tool Class for Dashboard Modal Customizer */
export class GameinfoTool {
  constructor() {
    this.title = "黑神話：悟空 (Black Myth: Wukong)";
    this.dev = "Game Science (遊戲科學)";
    this.genre = "動作 RPG";
    this.rating = "9.5";
    this.price = "NT$ 1,280";
    this.cover = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80";
    this.hideBtn = "false";
  }

  init(options = {}) {
    this.title = options.title || "黑神話：悟空 (Black Myth: Wukong)";
    this.dev = options.dev || "Game Science (遊戲科學)";
    this.genre = options.genre || "動作 RPG";
    this.rating = options.rating || "9.5";
    this.price = options.price || "NT$ 1,280";
    this.cover = options.cover || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80";
    this.hideBtn = options.hidebtn || "false";
  }

  renderHTML(containerEl, isObsMode = false) {
    const encodedTitle = encodeURIComponent(this.title);
    const encodedDev = encodeURIComponent(this.dev);
    const encodedGenre = encodeURIComponent(this.genre);
    const encodedRating = encodeURIComponent(this.rating);
    const encodedPrice = encodeURIComponent(this.price);
    const encodedCover = encodeURIComponent(this.cover);

    const iframeUrl = `gameinfo.html?title=${encodedTitle}&dev=${encodedDev}&genre=${encodedGenre}&rating=${encodedRating}&price=${encodedPrice}&cover=${encodedCover}&hidebtn=${this.hideBtn}`;

    containerEl.innerHTML = `
      <div style="width: 100%; height: 260px; position: relative; display: flex; justify-content: center; align-items: center;">
        <iframe src="${iframeUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: transparent;"></iframe>
      </div>
    `;
  }
}
