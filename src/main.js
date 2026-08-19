// Main Game Controller, Loop & State Manager

import { Renderer } from './renderer.js';
import { Unicorn } from './unicorn.js';
import { EntityManager } from './entities.js';
import { ParticleManager } from './particles.js';
import { UIManager } from './ui.js';
import {
  initAudio, toggleMute, playJump, playDoubleJump,
  playGemCollect, playPowerup, playCrash, startMusic, stopMusic
} from './audio.js';

const STATE_START = 0;
const STATE_PLAYING = 1;
const STATE_GAMEOVER = 2;

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.particleMgr = new ParticleManager();
    this.entityMgr = new EntityManager();

    this.state = STATE_START;

    // Game stats
    this.score = 0;
    this.gemsCollected = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.distance = 0;
    this.baseSpeed = 340;
    this.gameSpeed = 340;

    // Initial positioning
    const initialGroundY = this.renderer.getRainbowY(140);
    this.unicorn = new Unicorn(140, initialGroundY);

    // UI Manager
    this.ui = new UIManager({
      onStart: () => this.startGame(),
      onRestart: () => this.startGame(),
      onToggleSound: () => toggleMute()
    });

    // Resize setup
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Input handlers
    this.initInputs();

    // Loop variables
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.resize(w, h);
    const gY = this.renderer.getRainbowY(this.unicorn.x);
    this.unicorn.groundY = gY;
  }

  initInputs() {
    // Keyboard listener
    window.addEventListener('keydown', (e) => {
      initAudio();
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.triggerJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        this.triggerDuck(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.triggerDuck(false);
      }
    });

    // Touch / Mouse listener
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      initAudio();
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        this.triggerJump();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const deltaY = e.touches[0].clientY - touchStartY;
        if (deltaY > 30) {
          this.triggerDuck(true);
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.triggerDuck(false);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        initAudio();
        this.triggerJump();
      }
    });
  }

  triggerJump() {
    if (this.state === STATE_PLAYING) {
      const jumpVal = this.unicorn.jump();
      if (jumpVal === 1) {
        playJump();
        this.particleMgr.addSparkles(this.unicorn.x, this.unicorn.y, 6);
      } else if (jumpVal === 2) {
        playDoubleJump();
        this.particleMgr.addSparkles(this.unicorn.x, this.unicorn.y, 10, ['#00e5ff', '#7c4dff']);
        this.particleMgr.addFloatingText('DOUBLE JUMP!', this.unicorn.x, this.unicorn.y - 40, '#00e5ff', 14);
      }
    } else if (this.state === STATE_START) {
      document.getElementById('btn-start').click();
    } else if (this.state === STATE_GAMEOVER) {
      document.getElementById('btn-restart').click();
    }
  }

  triggerDuck(ducking) {
    if (this.state === STATE_PLAYING) {
      this.unicorn.setDucking(ducking);
    }
  }

  startGame() {
    this.score = 0;
    this.gemsCollected = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.distance = 0;
    this.gameSpeed = this.baseSpeed;

    const gY = this.renderer.getRainbowY(140);
    this.unicorn.reset(gY);
    this.entityMgr.reset();
    this.particleMgr = new ParticleManager();

    this.state = STATE_PLAYING;
    startMusic();
  }

  gameOver(reason = 'You collided with dark magic!') {
    this.state = STATE_GAMEOVER;
    stopMusic();
    playCrash();
    this.particleMgr.triggerShake(18, 0.4);

    const isNewRecord = this.ui.saveHighScore(Math.floor(this.score));
    document.getElementById('gameover-reason').textContent = reason;
    this.ui.showGameOver(this.score, this.gemsCollected, this.maxCombo, this.distance, isNewRecord);
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state === STATE_PLAYING) {
      // Speed ramp up based on distance
      this.distance += (this.gameSpeed * dt) * 0.05;
      this.gameSpeed = this.baseSpeed + Math.min(300, this.distance * 0.3);

      // Passive score increase
      this.score += dt * 15 * this.combo;

      // Update entities
      const groundYAtUnicorn = this.renderer.getRainbowY(this.unicorn.x, this.renderer.scrollX);
      this.unicorn.update(dt, groundYAtUnicorn, this.particleMgr);

      this.entityMgr.update(dt, this.gameSpeed, this.canvas.width, this.renderer, this.particleMgr);

      // Check collisions
      const hits = this.entityMgr.checkCollisions(this.unicorn);

      // 1. Process Collectibles
      for (const col of hits.collected) {
        if (col.type === 'star') {
          playGemCollect();
          const pts = 100 * this.combo;
          this.score += pts;
          this.gemsCollected++;
          this.combo++;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.particleMgr.addSparkles(col.x, col.y, 10, ['#ffd700', '#ffffff']);
          this.particleMgr.addFloatingText(`+${pts}`, col.x, col.y, '#ffd700', 18);
        } else if (col.type === 'donut') {
          playPowerup();
          const pts = 250 * this.combo;
          this.score += pts;
          this.gemsCollected++;
          this.combo += 2;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.particleMgr.addSparkles(col.x, col.y, 16, ['#ff4081', '#00e5ff']);
          this.particleMgr.addFloatingText(`DONUT BOOST! +${pts}`, col.x, col.y, '#ff4081', 18);
        } else if (col.type === 'shield') {
          playPowerup();
          this.unicorn.shieldTimer = 6.0; // 6 seconds shield
          this.particleMgr.addSparkles(col.x, col.y, 20, ['#00e5ff', '#ffffff']);
          this.particleMgr.addFloatingText('SHIELD CHARGED! 🛡️', col.x, col.y, '#00e5ff', 18);
        }
      }

      // 2. Process Obstacle Collision
      if (hits.obstacle) {
        if (this.unicorn.shieldTimer > 0) {
          // Shield absorbs the collision!
          playPowerup();
          this.unicorn.shieldTimer = 0; // Consume shield
          this.particleMgr.triggerShake(10, 0.25);
          this.particleMgr.addSparkles(hits.obstacle.x, hits.obstacle.y, 24, ['#00e5ff', '#ff4081']);
          this.particleMgr.addFloatingText('SHIELD BROKEN!', hits.obstacle.x, hits.obstacle.y, '#ff0055', 20);
          // Destroy obstacle
          const idx = this.entityMgr.obstacles.indexOf(hits.obstacle);
          if (idx !== -1) this.entityMgr.obstacles.splice(idx, 1);
        } else {
          // Game Over!
          this.combo = 1;
          const reason = hits.obstacle.type === 'skull'
            ? 'Touched a shadow skull!'
            : 'Zapped by a dark storm cloud!';
          this.gameOver(reason);
        }
      }

      // Update HUD UI
      this.ui.updateHUD(this.score, this.combo, this.unicorn.shieldTimer);
    }

    // Always update particles
    this.particleMgr.update(dt);
  }

  render() {
    const ctx = this.renderer.ctx;
    const shake = this.particleMgr.getShakeOffset();

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // 1. Parallax Sky & Background
    this.renderer.renderBackground(0.016, this.state === STATE_PLAYING ? this.gameSpeed * 0.5 : 80);

    // 2. Rainbow Highway Ribbon Track
    this.renderer.renderRainbowTrack();

    // 3. Spawns & Collectibles
    this.entityMgr.render(ctx);

    // 4. Unicorn Character
    this.unicorn.render(ctx);

    // 5. Particle Explosions & Floating Text
    this.particleMgr.render(ctx);

    ctx.restore();
  }
}

// Instantiate game on page load
window.addEventListener('load', () => {
  new Game();
});
