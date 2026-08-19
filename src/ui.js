// UI & LocalStorage High Score Manager

export class UIManager {
  constructor(callbacks) {
    this.callbacks = callbacks; // { onStart, onRestart, onToggleSound }

    // DOM Elements
    this.elScore = document.getElementById('hud-score');
    this.elBest = document.getElementById('hud-best');
    this.elCombo = document.getElementById('hud-combo');
    this.elComboVal = document.getElementById('hud-combo-val');
    this.elShield = document.getElementById('hud-shield');
    this.elShieldVal = document.getElementById('hud-shield-val');

    this.startScreen = document.getElementById('start-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.newBestBadge = document.getElementById('new-best-badge');
    this.btnSound = document.getElementById('btn-sound');

    this.statScore = document.getElementById('stat-score');
    this.statBest = document.getElementById('stat-best');
    this.statGems = document.getElementById('stat-gems');
    this.statCombo = document.getElementById('stat-combo');
    this.statDistance = document.getElementById('stat-distance');

    this.highScore = this.loadHighScore();
    this.updateHighScoreDisplay(this.highScore);

    this.initEvents();
  }

  loadHighScore() {
    try {
      const val = localStorage.getItem('js13k_2026_unicorn_sky_runner_hi');
      return val ? parseInt(val, 10) : 0;
    } catch(e) {
      return 0;
    }
  }

  saveHighScore(score) {
    if (score > this.highScore) {
      this.highScore = score;
      try {
        localStorage.setItem('js13k_2026_unicorn_sky_runner_hi', score.toString());
      } catch(e) {}
      this.updateHighScoreDisplay(score);
      return true; // New record!
    }
    return false;
  }

  updateHighScoreDisplay(score) {
    if (this.elBest) this.elBest.textContent = score;
    if (this.statBest) this.statBest.textContent = score;
  }

  initEvents() {
    document.getElementById('btn-start').addEventListener('click', (e) => {
      e.stopPropagation();
      this.startScreen.classList.add('hidden');
      if (this.callbacks.onStart) this.callbacks.onStart();
    });

    document.getElementById('btn-restart').addEventListener('click', (e) => {
      e.stopPropagation();
      this.gameoverScreen.classList.add('hidden');
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    this.btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.callbacks.onToggleSound) {
        const isMuted = this.callbacks.onToggleSound();
        this.btnSound.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  updateHUD(score, combo, shieldTime) {
    this.elScore.textContent = Math.floor(score);

    if (combo > 1) {
      this.elComboVal.textContent = `x${combo}`;
      this.elCombo.classList.add('active');
    } else {
      this.elCombo.classList.remove('active');
    }

    if (shieldTime > 0) {
      this.elShieldVal.textContent = `${Math.ceil(shieldTime)}s`;
      this.elShield.classList.add('active');
    } else {
      this.elShield.classList.remove('active');
    }
  }

  showGameOver(score, gems, maxCombo, distance, isNewRecord) {
    this.statScore.textContent = Math.floor(score);
    this.statGems.textContent = gems;
    this.statCombo.textContent = `x${maxCombo}`;
    this.statDistance.textContent = `${Math.floor(distance)} m`;
    this.statBest.textContent = this.highScore;

    if (isNewRecord) {
      this.newBestBadge.style.display = 'inline-block';
    } else {
      this.newBestBadge.style.display = 'none';
    }

    this.gameoverScreen.classList.remove('hidden');
  }
}
