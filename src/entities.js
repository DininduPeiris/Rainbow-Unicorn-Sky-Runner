// Spawner, Entities & Collision Detection System

export class EntityManager {
  constructor() {
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2.0; // Seconds between spawns
    this.minSpawnInterval = 0.85;
  }

  reset() {
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2.0;
  }

  update(dt, gameSpeed, screenWidth, renderer, particleMgr) {
    // Ramp up difficulty slightly over time
    this.spawnInterval = Math.max(this.minSpawnInterval, 2.0 - (gameSpeed - 300) * 0.002);
    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnPattern(screenWidth, renderer);
    }

    // Move & update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= gameSpeed * dt;
      obs.animTime += dt * 6;

      // Snap ground Y dynamically to rainbow wave curve!
      if (obs.onGround) {
        obs.y = renderer.getRainbowY(obs.x);
      }

      if (obs.x < -80) {
        this.obstacles.splice(i, 1);
      }
    }

    // Move & update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= gameSpeed * dt;
      col.animTime += dt * 4;

      if (col.onGround) {
        col.y = renderer.getRainbowY(col.x) - col.floatOffset;
      }

      if (col.x < -80) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  spawnPattern(screenWidth, renderer) {
    const spawnX = screenWidth + 80;
    const rand = Math.random();

    if (rand < 0.45) {
      // Spawn Low Ground Obstacle (Shadow Skull)
      this.obstacles.push({
        type: 'skull',
        x: spawnX,
        y: renderer.getRainbowY(spawnX),
        width: 40,
        height: 40,
        onGround: true,
        animTime: 0
      });
      // Optionally spawn a gem line above skull!
      if (Math.random() < 0.6) {
        this.collectibles.push({
          type: 'star',
          x: spawnX,
          y: renderer.getRainbowY(spawnX) - 90,
          width: 28,
          height: 28,
          floatOffset: 90,
          onGround: true,
          animTime: 0
        });
      }
    } else if (rand < 0.75) {
      // Spawn High Air Obstacle (Storm Cloud)
      const cloudY = renderer.getRainbowY(spawnX) - 110;
      this.obstacles.push({
        type: 'cloud',
        x: spawnX,
        y: cloudY,
        width: 55,
        height: 42,
        onGround: false,
        animTime: 0
      });
      // Spawn gem under cloud (encourages ducking!)
      this.collectibles.push({
        type: Math.random() < 0.3 ? 'donut' : 'star',
        x: spawnX,
        y: renderer.getRainbowY(spawnX) - 25,
        width: 28,
        height: 28,
        floatOffset: 25,
        onGround: true,
        animTime: 0
      });
    } else {
      // Spawn Powerup or Reward Arc (Star / Donut / Shield)
      const rewardType = Math.random() < 0.18 ? 'shield' : (Math.random() < 0.4 ? 'donut' : 'star');
      const arcHeight = Math.random() < 0.5 ? 40 : 100;
      this.collectibles.push({
        type: rewardType,
        x: spawnX,
        y: renderer.getRainbowY(spawnX) - arcHeight,
        width: 32,
        height: 32,
        floatOffset: arcHeight,
        onGround: true,
        animTime: 0
      });
    }
  }

  checkCollisions(unicorn) {
    const uBox = unicorn.getHitbox();
    const hits = {
      obstacle: null,
      collected: []
    };

    // Check Obstacles
    for (const obs of this.obstacles) {
      let oBox;
      if (obs.type === 'skull') {
        oBox = { x: obs.x - 20, y: obs.y - 36, width: 36, height: 36 };
      } else { // cloud
        oBox = { x: obs.x - 26, y: obs.y - 20, width: 50, height: 38 };
      }

      if (this.intersects(uBox, oBox)) {
        hits.obstacle = obs;
        break;
      }
    }

    // Check Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      const cBox = { x: col.x - 16, y: col.y - 16, width: 32, height: 32 };

      if (this.intersects(uBox, cBox)) {
        hits.collected.push(col);
        this.collectibles.splice(i, 1);
      }
    }

    return hits;
  }

  intersects(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  render(ctx) {
    ctx.save();

    // 1. Render Obstacles
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'skull') {
        // Shadow Skull / Void Orb
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 12;

        // Dark aura
        ctx.fillStyle = '#2d0617';
        ctx.beginPath();
        ctx.arc(0, -18, 18, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(-6, -20, 4, 0, Math.PI * 2);
        ctx.arc(6, -20, 4, 0, Math.PI * 2);
        ctx.fill();

        // Dark flame pulse spikes
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        const spikeAngle = Math.sin(obs.animTime * 3) * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, -36); ctx.lineTo(Math.sin(spikeAngle) * 4, -44);
        ctx.stroke();
      } else {
        // Dark Storm Cloud
        ctx.shadowColor = '#7c4dff';
        ctx.shadowBlur = 15;

        // Dark Cloud Body
        ctx.fillStyle = '#1e1838';
        ctx.beginPath();
        ctx.arc(-15, 0, 16, 0, Math.PI * 2);
        ctx.arc(0, -10, 20, 0, Math.PI * 2);
        ctx.arc(15, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Lightning Flash Crackle
        if (Math.sin(obs.animTime * 4) > 0.3) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(-6, 22);
          ctx.lineTo(4, 24);
          ctx.lineTo(-2, 36);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 2. Render Collectibles
    for (const col of this.collectibles) {
      ctx.save();
      const floatY = Math.sin(col.animTime * 2) * 5;
      ctx.translate(col.x, col.y + floatY);

      if (col.type === 'star') {
        // Golden Star Gem
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos((18 + i * 72) * Math.PI / 180) * 14,
            -Math.sin((18 + i * 72) * Math.PI / 180) * 14
          );
          ctx.lineTo(
            Math.cos((54 + i * 72) * Math.PI / 180) * 6,
            -Math.sin((54 + i * 72) * Math.PI / 180) * 6
          );
        }
        ctx.closePath();
        ctx.fill();
      } else if (col.type === 'donut') {
        // Rainbow Magic Donut
        ctx.shadowColor = '#ff4081';
        ctx.shadowBlur = 14;
        // Base donut ring
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        // Frosting
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        // Donut Hole
        ctx.fillStyle = '#090614';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (col.type === 'shield') {
        // Cyan Shield Crystal
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
