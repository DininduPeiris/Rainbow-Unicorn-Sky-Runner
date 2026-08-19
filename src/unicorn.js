// Unicorn Player Entity (Procedural Canvas Drawing, Animations & Physics)

export class Unicorn {
  constructor(x, groundY) {
    this.x = x;
    this.groundY = groundY;
    this.y = groundY;
    this.width = 54;
    this.height = 54;

    // Physics
    this.vy = 0;
    this.gravity = 0.65;
    this.jumpForce = -13.5;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2; // Double jump enabled!
    this.isDucking = false;

    // Powerups
    this.shieldTimer = 0;

    // Animation variables
    this.animTime = 0;
    this.tailColors = ['#ff4081', '#ffd700', '#00e5ff', '#7c4dff'];
  }

  reset(groundY) {
    this.groundY = groundY;
    this.y = groundY;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.isDucking = false;
    this.shieldTimer = 0;
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.jumpCount++;
      return this.jumpCount; // 1 = jump, 2 = double jump
    }
    return 0;
  }

  setDucking(ducking) {
    this.isDucking = ducking;
    if (ducking && !this.isGrounded) {
      // Fast fall down
      this.vy += 6;
    }
  }

  update(dt, groundY, particleMgr) {
    this.groundY = groundY;
    this.animTime += dt * 12;

    // Apply gravity
    if (!this.isGrounded) {
      this.vy += this.gravity;
      this.y += this.vy;

      // Landing check
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpCount = 0;
      }
    } else {
      this.y = this.groundY;
      // Emit rainbow hoof dust while running
      if (Math.random() < 0.4 && particleMgr) {
        const c = this.tailColors[Math.floor(Math.random() * this.tailColors.length)];
        particleMgr.addTrailParticle(this.x - 10, this.y + 20, c);
      }
    }

    // Shield timer decay
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
    }
  }

  getHitbox() {
    const h = this.isDucking ? this.height * 0.6 : this.height;
    const yOffset = this.isDucking ? this.height * 0.4 : 0;
    return {
      x: this.x - this.width / 2 + 10,
      y: this.y - this.height + yOffset + 10,
      width: this.width - 18,
      height: h - 12
    };
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Squash & stretch physics response
    let scaleX = 1;
    let scaleY = 1;
    if (!this.isGrounded) {
      if (this.vy < 0) { scaleX = 0.88; scaleY = 1.12; } // Jumping up
      else { scaleX = 1.1; scaleY = 0.9; } // Falling down
    } else if (this.isDucking) {
      scaleX = 1.25; scaleY = 0.65;
    }
    ctx.scale(scaleX, scaleY);

    // 1. Flowing Rainbow Tail
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = this.tailColors[i];
      const tailOffset = Math.sin(this.animTime + i * 0.5) * 6;
      ctx.beginPath();
      ctx.ellipse(-20 - i * 4, -20 + tailOffset, 12, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Main Body (Sleek White/Pink Soft Curved Torso)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -22, 22, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft pink belly highlight
    ctx.fillStyle = '#ffe0ec';
    ctx.beginPath();
    ctx.ellipse(2, -18, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Legs (Animated Running Legs)
    ctx.fillStyle = '#f8f8fc';
    const legPhase = this.isGrounded ? Math.sin(this.animTime) * 12 : 6;
    // Front Legs
    ctx.fillRect(8, -10, 5, 14 + legPhase * 0.5);
    ctx.fillRect(16, -10, 5, 14 - legPhase * 0.5);
    // Back Legs
    ctx.fillRect(-14, -10, 5, 14 - legPhase * 0.5);
    ctx.fillRect(-6, -10, 5, 14 + legPhase * 0.5);
    // Golden Hooves
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(8, 4 + legPhase * 0.5, 5, 4);
    ctx.fillRect(16, 4 - legPhase * 0.5, 5, 4);
    ctx.fillRect(-14, 4 - legPhase * 0.5, 5, 4);
    ctx.fillRect(-6, 4 + legPhase * 0.5, 5, 4);

    // 4. Neck & Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(16, -34, 12, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.fillStyle = '#ffc0cb';
    ctx.beginPath();
    ctx.arc(24, -31, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1a0933';
    ctx.beginPath();
    ctx.arc(18, -36, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(19, -37, 1, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(12, -42);
    ctx.lineTo(16, -50);
    ctx.lineTo(20, -42);
    ctx.closePath();
    ctx.fill();

    // 5. Flowing Rainbow Mane
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = this.tailColors[i];
      const maneOffset = Math.cos(this.animTime + i) * 4;
      ctx.beginPath();
      ctx.arc(6 - i * 4, -38 + maneOffset, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. MAGICAL GLOWING HORN ✨
    const hornGlow = Math.sin(this.animTime * 2) * 4 + 8;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = hornGlow;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(20, -42);
    ctx.lineTo(34, -58);
    ctx.lineTo(25, -44);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // 7. Shield Bubble Powerup Overlay (if active)
    if (this.shieldTimer > 0) {
      const pulse = Math.sin(this.animTime * 3) * 3;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(5, -24, 38 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
