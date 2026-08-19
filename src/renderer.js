// Canvas Renderer: Parallax Starry Sky, Moon, Mountains, and Undulating Rainbow Highway

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Rainbow track configuration (7 vibrant bands)
    this.rainbowBands = [
      '#ff2a6d', // Bright Pinkish Red
      '#ff7e00', // Neon Orange
      '#ffd700', // Gold Yellow
      '#05ffa1', // Neon Green
      '#00e5ff', // Cyan
      '#3b82f6', // Deep Blue
      '#9333ea'  // Purple Violet
    ];

    // Starfield generation
    this.stars = [];
    this.initStars(80);

    // Parallax distance tracking
    this.scrollX = 0;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.initStars(Math.floor(w / 12));
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.65),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.5
      });
    }
  }

  // Calculates the Y position of the Rainbow track surface at any screen X
  getRainbowY(x, scrollX = this.scrollX) {
    const baseGroundY = this.height * 0.76;
    // Smooth wavy sine wave motion
    const wave = Math.sin((x + scrollX * 0.4) * 0.003) * 16 + Math.cos((x + scrollX * 0.2) * 0.005) * 8;
    return baseGroundY + wave;
  }

  renderBackground(dt, scrollSpeed) {
    this.scrollX += scrollSpeed * dt * 60;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#06030e');
    skyGrad.addColorStop(0.5, '#190a2a');
    skyGrad.addColorStop(1, '#321042');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Glowing Moon
    ctx.save();
    const moonX = w * 0.85;
    const moonY = h * 0.2;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
    moonGlow.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
    moonGlow.addColorStop(0.4, 'rgba(255, 200, 230, 0.3)');
    moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Twinkling Stars (Parallax Layer 1)
    ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      const starX = (star.x - this.scrollX * 0.05) % w;
      const finalX = starX < 0 ? starX + w : starX;
      const alpha = 0.5 + Math.sin(Date.now() * 0.002 * star.twinkleSpeed) * 0.4;
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.beginPath();
      ctx.arc(finalX, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 4. Distant Glowing Nebula Mountains (Parallax Layer 2)
    ctx.save();
    ctx.fillStyle = 'rgba(40, 15, 65, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 40; x += 40) {
      const mtnY = h * 0.62 + Math.sin((x + this.scrollX * 0.1) * 0.008) * 45;
      ctx.lineTo(x, mtnY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderRainbowTrack() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const bandHeight = 6;
    const totalBands = this.rainbowBands.length;

    ctx.save();

    // Render multi-band ribbon track
    for (let b = 0; b < totalBands; b++) {
      ctx.fillStyle = this.rainbowBands[b];
      ctx.beginPath();

      // Top wave line
      for (let x = -10; x <= w + 10; x += 10) {
        const y = this.getRainbowY(x) + b * bandHeight;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Bottom wave line (thickness)
      for (let x = w + 10; x >= -10; x -= 10) {
        const y = this.getRainbowY(x) + (b + 1) * bandHeight;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fill();
    }

    // Outer Rainbow Glow
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -10; x <= w + 10; x += 10) {
      const y = this.getRainbowY(x);
      if (x === -10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fast moving rainbow sheen stripes to convey high speed
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    const stripeSpacing = 60;
    const offset = (this.scrollX * 1.5) % stripeSpacing;
    for (let x = -stripeSpacing; x <= w + stripeSpacing; x += stripeSpacing) {
      const currentX = x - offset;
      const topY = this.getRainbowY(currentX);
      const botY = topY + totalBands * bandHeight;
      ctx.beginPath();
      ctx.moveTo(currentX, topY);
      ctx.lineTo(currentX + 20, topY);
      ctx.lineTo(currentX + 10, botY);
      ctx.lineTo(currentX - 10, botY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
