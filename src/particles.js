// Particle System & Visual FX Engine

export class ParticleManager {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
  }

  addSparkles(x, y, count = 12, colors = ['#ffd700', '#ff4081', '#00e5ff', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward float
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        shape: Math.random() > 0.5 ? 'star' : 'circle'
      });
    }
  }

  addTrailParticle(x, y, color = '#ff4081') {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: -(1 + Math.random() * 2), // drifts backward
      vy: (Math.random() - 0.5) * 1.5,
      size: 3 + Math.random() * 3,
      color,
      alpha: 0.8,
      life: 1,
      decay: 0.04,
      shape: 'circle'
    });
  }

  addFloatingText(text, x, y, color = '#ffd700', fontSize = 18) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.5,
      alpha: 1,
      color,
      fontSize,
      life: 1,
      decay: 0.025
    });
  }

  triggerShake(intensity = 10, duration = 0.3) {
    this.screenShakeIntensity = intensity;
    this.screenShakeTime = duration;
  }

  update(dt) {
    // Screen shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      if (this.screenShakeTime <= 0) this.screenShakeIntensity = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= ft.decay;
      ft.alpha = Math.max(0, ft.life);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Render particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            p.x + Math.cos((18 + i * 72) * Math.PI / 180) * p.size,
            p.y - Math.sin((18 + i * 72) * Math.PI / 180) * p.size
          );
          ctx.lineTo(
            p.x + Math.cos((54 + i * 72) * Math.PI / 180) * (p.size / 2),
            p.y - Math.sin((54 + i * 72) * Math.PI / 180) * (p.size / 2)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render floating texts
    ctx.font = '900 16px var(--font-main), sans-serif';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  getShakeOffset() {
    if (this.screenShakeTime <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.screenShakeIntensity,
      y: (Math.random() - 0.5) * this.screenShakeIntensity
    };
  }
}
