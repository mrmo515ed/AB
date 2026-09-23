/* =========================================================================
   ANIME BLACK GAMES — PART 2: 2D CANVAS COMBAT & ACTION RUNNER ENGINE
   ========================================================================= */

class AnimeHunterEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.char = options.character || (S.game && S.game.characters[0]);
    this.stage = options.stage || (S.game && S.game.stages[0]);
    this.onGameOver = options.onGameOver || function(){};
    this.onVictory = options.onVictory || function(){};
    
    this.running = false;
    this.paused = false;
    this.startTime = Date.now();
    
    // Virtual resolution
    this.width = 400;
    this.height = 680;
    
    // Gameplay Stats
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.gems = 0;
    this.shards = 0;
    this.chests = 0;
    this.kills = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    
    // Player State
    this.lane = 1; // 0: Left, 1: Center, 2: Right
    this.targetLaneX = 200;
    this.playerX = 200;
    this.playerY = 540;
    this.baseY = 540;
    this.vy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.hp = this.char.hp || 1000;
    this.maxHp = this.hp;
    this.energy = 100;
    this.transMeter = 0; // 0 to 100
    this.isTransformed = false;
    this.transTimer = 0;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.skillCooldown = 0;
    
    // Powerups
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.multiplierActive = false;
    this.multiplierTimer = 0;
    
    // Game Entities
    this.lanesX = [100, 200, 300];
    this.speed = (this.stage.speed || 1.0) * 5.0;
    this.obstacles = [];
    this.enemies = [];
    this.pickups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.slashes = [];
    
    // Boss State
    this.boss = null;
    this.bossDistance = 1500; // Boss spawns at 1500m
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.warningActive = false;
    this.warningTimer = 0;

    // Shake
    this.screenShake = 0;

    this.initCanvasSize();
    this.initInputs();
  }

  initCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = (rect.width || 400) * dpr;
    this.canvas.height = (rect.height || 680) * dpr;
    this.ctx.scale(dpr * ((rect.width || 400) / this.width), dpr * ((rect.height || 680) / this.height));
  }

  initInputs() {
    this.keyDownHandler = (e) => {
      if (!this.running || this.paused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.moveLane(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveLane(1);
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') this.jump();
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.slide();
      else if (e.key === 'j' || e.key === 'J') this.attack();
      else if (e.key === 'k' || e.key === 'K') this.useSkill();
      else if (e.key === 'l' || e.key === 'L') this.activateTransformation();
    };
    window.addEventListener('keydown', this.keyDownHandler);

    // Touch Swipes
    let startX = 0, startY = 0;
    this.touchStartHandler = (e) => {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };
    this.touchEndHandler = (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) > 25) {
        if (absX > absY) {
          if (dx > 0) this.moveLane(1);
          else this.moveLane(-1);
        } else {
          if (dy < 0) this.jump();
          else this.slide();
        }
      }
    };
    this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }

  destroy() {
    this.running = false;
    window.removeEventListener('keydown', this.keyDownHandler);
    this.canvas.removeEventListener('touchstart', this.touchStartHandler);
    this.canvas.removeEventListener('touchend', this.touchEndHandler);
  }

  start() {
    this.running = true;
    this.startTime = Date.now();
    this.lastFrame = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  moveLane(dir) {
    this.lane = Math.max(0, Math.min(2, this.lane + dir));
    this.targetLaneX = this.lanesX[this.lane];
    this.addParticles(this.playerX, this.playerY, 5, '#67E8F9');
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.vy = -14;
      this.isSliding = false;
      window.gameSnd('jump');
      this.addParticles(this.playerX, this.playerY + 20, 8, '#FBBF24');
    }
  }

  slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 35;
      if (this.isJumping) this.vy = 12; // Fast drop
      this.addParticles(this.playerX, this.playerY + 10, 6, '#A78BFA');
    }
  }

  attack() {
    this.isAttacking = true;
    this.attackTimer = 18;
    window.gameSnd('slash');
    
    // Slash Visual
    this.slashes.push({
      x: this.playerX,
      y: this.playerY - 20,
      radius: 55,
      angle: Math.random() * Math.PI,
      alpha: 1.0,
      color: this.isTransformed ? '#F59E0B' : (this.char.color || '#00A3FF')
    });

    // Hit test nearby enemies
    const hitRange = 110;
    let hitCount = 0;

    this.enemies.forEach(en => {
      if (Math.abs(en.x - this.playerX) < 60 && Math.abs(en.y - this.playerY) < hitRange) {
        const damage = Math.floor((this.char.attack || 120) * (this.isTransformed ? 2.5 : 1.0) * (1 + (this.combo * 0.05)));
        const isCrit = Math.random() * 100 < (this.char.critical || 10);
        const finalDmg = isCrit ? Math.floor(damage * 1.8) : damage;
        
        en.hp -= finalDmg;
        hitCount++;
        window.gameSnd('hit');
        this.addFloatingText(en.x, en.y - 20, `${isCrit ? '💥 CRIT! ' : '⚔️ '}${finalDmg}`, isCrit ? '#EF4444' : '#FBBF24');
        this.addParticles(en.x, en.y, 12, '#EF4444');
        this.screenShake = isCrit ? 6 : 3;

        if (en.hp <= 0) {
          this.defeatEnemy(en);
        }
      }
    });

    // Boss hit test
    if (this.boss && Math.abs(this.boss.x - this.playerX) < 120 && Math.abs(this.boss.y - this.playerY) < 140) {
      const dmg = Math.floor((this.char.attack || 120) * (this.isTransformed ? 2.2 : 1.0));
      this.boss.hp -= dmg;
      window.gameSnd('hit');
      this.addFloatingText(this.boss.x, this.boss.y - 40, `💥 ${dmg}`, '#EC4899');
      this.addParticles(this.boss.x, this.boss.y, 15, '#EC4899');
      this.screenShake = 7;
      if (this.boss.hp <= 0) {
        this.defeatBoss();
      }
    }

    if (hitCount > 0) {
      this.combo += hitCount;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboTimer = 180; // 3 seconds
      this.transMeter = Math.min(100, this.transMeter + hitCount * 6);
    }
  }

  useSkill() {
    if (this.skillCooldown > 0) return;
    this.skillCooldown = 300; // 5s
    window.gameSnd('transform');
    this.screenShake = 10;
    
    this.addFloatingText(this.playerX, this.playerY - 60, `⚡ ${this.char.skillName}!`, '#38BDF8');
    this.addParticles(this.playerX, this.playerY, 30, '#38BDF8');

    // Wipe screen enemies
    this.enemies.forEach(en => {
      en.hp -= (this.char.skillPower || 300);
      this.addFloatingText(en.x, en.y, `💥 ${this.char.skillPower}`, '#38BDF8');
      if (en.hp <= 0) this.defeatEnemy(en);
    });

    if (this.boss) {
      this.boss.hp -= (this.char.skillPower || 300);
      this.addFloatingText(this.boss.x, this.boss.y, `💥 ${this.char.skillPower}`, '#38BDF8');
      if (this.boss.hp <= 0) this.defeatBoss();
    }
  }

  activateTransformation() {
    if (this.transMeter < 100) return;
    this.transMeter = 0;
    this.isTransformed = true;
    this.transTimer = 600; // 10s
    window.gameSnd('transform');
    this.screenShake = 15;
    this.shieldActive = true;
    this.shieldTimer = 600;

    this.addFloatingText(this.playerX, this.playerY - 80, `🔥 TRANSFORMATION AWAKENED!`, '#F59E0B');
    for (let i = 0; i < 50; i++) {
      this.addParticles(this.playerX, this.playerY, 1, '#FBBF24');
    }
  }

  defeatEnemy(en) {
    en.dead = true;
    this.kills++;
    this.score += 250 * (this.multiplierActive ? 2 : 1);
    
    // Chance to drop coins / shards
    const dropType = Math.random();
    if (dropType < 0.6) {
      this.pickups.push({ x: en.x, y: en.y, type: 'coin', val: 10 });
    } else if (dropType < 0.85) {
      this.pickups.push({ x: en.x, y: en.y, type: 'shard', val: 2 });
    } else if (dropType < 0.95) {
      this.pickups.push({ x: en.x, y: en.y, type: 'gem', val: 1 });
    } else {
      this.pickups.push({ x: en.x, y: en.y, type: 'chest', val: 1 });
    }
  }

  defeatBoss() {
    this.boss = null;
    this.bossDefeated = true;
    window.gameSnd('victory');
    this.score += 50000;
    this.coins += 500;
    this.gems += 20;
    this.shards += 50;
    this.chests += 2;
    this.addFloatingText(200, 300, `🏆 BOSS DEFEATED! VICTORY!`, '#34D399');
    setTimeout(() => {
      this.running = false;
      this.onVictory(this.collectResults());
    }, 1800);
  }

  collectResults() {
    return {
      startTime: this.startTime,
      endTime: Date.now(),
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      kills: this.kills,
      maxCombo: this.maxCombo,
      coins: this.coins,
      gems: this.gems,
      shards: this.shards,
      chests: this.chests,
      bossDefeated: this.bossDefeated,
      char: this.char,
      stage: this.stage
    };
  }

  addParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 4 + 2,
        color: color,
        alpha: 1.0,
        life: 25
      });
    }
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      alpha: 1.0,
      vy: -1.5,
      life: 45
    });
  }

  // --- Main Update Loop ---
  update() {
    if (this.paused || !this.running) return;

    this.distance += this.speed * 0.15;
    this.score += Math.floor(this.speed * 0.4) * (this.multiplierActive ? 2 : 1);

    // Player Smooth Lane Movement
    this.playerX += (this.targetLaneX - this.playerX) * 0.25;

    // Jumping Physics
    if (this.isJumping) {
      this.playerY += this.vy;
      this.vy += 0.85; // Gravity
      if (this.playerY >= this.baseY) {
        this.playerY = this.baseY;
        this.isJumping = false;
        this.vy = 0;
      }
    }

    // Sliding Timer
    if (this.isSliding) {
      this.slideTimer--;
      if (this.slideTimer <= 0) this.isSliding = false;
    }

    // Timers
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.skillCooldown > 0) this.skillCooldown--;
    if (this.screenShake > 0) this.screenShake *= 0.85;

    if (this.isTransformed) {
      this.transTimer--;
      if (this.transTimer <= 0) this.isTransformed = false;
      this.addParticles(this.playerX + (Math.random() - 0.5) * 20, this.playerY, 1, '#FBBF24');
    }

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    if (this.shieldTimer > 0) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }

    if (this.magnetTimer > 0) {
      this.magnetTimer--;
      if (this.magnetTimer <= 0) this.magnetActive = false;
    }

    // Spawn Obstacles & Enemies
    if (!this.bossSpawned) {
      if (Math.random() < 0.022) {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() < 0.5 ? 'barrier' : 'spikes';
        this.obstacles.push({
          lane: lane,
          x: this.lanesX[lane],
          y: -40,
          type: type,
          passed: false
        });
      }

      if (Math.random() < 0.03) {
        const lane = Math.floor(Math.random() * 3);
        const isElite = Math.random() < 0.2;
        this.enemies.push({
          lane: lane,
          x: this.lanesX[lane],
          y: -50,
          hp: isElite ? 350 : 120,
          maxHp: isElite ? 350 : 120,
          isElite: isElite,
          dead: false
        });
      }

      // Spawning Pickups
      if (Math.random() < 0.04) {
        const lane = Math.floor(Math.random() * 3);
        this.pickups.push({
          x: this.lanesX[lane],
          y: -30,
          type: Math.random() < 0.7 ? 'coin' : 'gem',
          val: 10
        });
      }
    }

    // Boss Spawn Trigger
    if (this.distance >= this.bossDistance && !this.bossSpawned && !this.bossDefeated) {
      this.bossSpawned = true;
      this.warningActive = true;
      this.warningTimer = 120;
      window.gameSnd('boss_warning');
      this.boss = {
        name: this.stage.bossName || "أكوما شيطان الظلال",
        x: 200,
        y: -100,
        targetY: 160,
        hp: this.stage.bossHp || 2500,
        maxHp: this.stage.bossHp || 2500,
        attackTimer: 100
      };
    }

    // Boss Logic
    if (this.boss) {
      this.boss.y += (this.boss.targetY - this.boss.y) * 0.05;
      this.boss.attackTimer--;
      if (this.boss.attackTimer <= 0) {
        this.boss.attackTimer = 110;
        // Boss strikes random lane
        const targetLane = Math.floor(Math.random() * 3);
        this.obstacles.push({
          lane: targetLane,
          x: this.lanesX[targetLane],
          y: this.boss.y + 40,
          type: 'boss_fireball',
          passed: false
        });
        this.addFloatingText(this.boss.x, this.boss.y, `🔥 ضربة الجحيم!`, '#EF4444');
      }
    }

    // Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      ob.y += this.speed;

      // Hitbox Collision
      if (!ob.passed && Math.abs(ob.x - this.playerX) < 40 && Math.abs(ob.y - this.playerY) < 35) {
        if (ob.type === 'spikes' && this.isJumping) {
          // Cleared spikes by jumping
        } else if (ob.type === 'barrier' && this.isSliding) {
          // Cleared barrier by sliding
        } else {
          ob.passed = true;
          this.takeDamage(120);
        }
      }

      if (ob.y > this.height + 50) this.obstacles.splice(i, 1);
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.y += this.speed * 0.85;

      if (!en.dead && Math.abs(en.x - this.playerX) < 35 && Math.abs(en.y - this.playerY) < 35) {
        en.dead = true;
        this.takeDamage(150);
      }

      if (en.y > this.height + 50 || en.dead) this.enemies.splice(i, 1);
    }

    // Update Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.y += this.speed;

      // Magnet pull
      if (this.magnetActive || this.char.id === 'c_luna') {
        pk.x += (this.playerX - pk.x) * 0.15;
        pk.y += (this.playerY - pk.y) * 0.15;
      }

      if (Math.abs(pk.x - this.playerX) < 40 && Math.abs(pk.y - this.playerY) < 40) {
        if (pk.type === 'coin') {
          this.coins += pk.val;
          window.gameSnd('coin');
          this.addFloatingText(pk.x, pk.y, `+${pk.val}🪙`, '#FBBF24');
        } else if (pk.type === 'gem') {
          this.gems += 1;
          window.gameSnd('coin');
          this.addFloatingText(pk.x, pk.y, `+1💎`, '#67E8F9');
        } else if (pk.type === 'shard') {
          this.shards += pk.val;
          this.addFloatingText(pk.x, pk.y, `+${pk.val}✨`, '#A78BFA');
        } else if (pk.type === 'chest') {
          this.chests += 1;
          this.addFloatingText(pk.x, pk.y, `📦 كنز!`, '#F59E0B');
        }
        this.pickups.splice(i, 1);
      } else if (pk.y > this.height + 50) {
        this.pickups.splice(i, 1);
      }
    }

    // Slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const sl = this.slashes[i];
      sl.alpha -= 0.08;
      if (sl.alpha <= 0) this.slashes.splice(i, 1);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  takeDamage(dmg) {
    if (this.shieldActive) {
      this.shieldActive = false;
      this.addFloatingText(this.playerX, this.playerY - 20, `🛡️ SHIELD BLOCKED!`, '#38BDF8');
      window.gameSnd('hit');
      return;
    }
    
    this.hp -= dmg;
    this.combo = 0;
    this.screenShake = 12;
    window.gameSnd('hit');
    this.addFloatingText(this.playerX, this.playerY - 20, `-${dmg} HP`, '#EF4444');
    this.addParticles(this.playerX, this.playerY, 15, '#EF4444');

    if (this.hp <= 0) {
      this.hp = 0;
      this.running = false;
      setTimeout(() => {
        this.onGameOver(this.collectResults());
      }, 800);
    }
  }

  // --- Rendering ---
  render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake
    if (this.screenShake > 0.5) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Background Sky / Stage
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#090D16');
    grad.addColorStop(0.6, '#111827');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid Perspective Lanes
    ctx.strokeStyle = 'rgba(0, 163, 255, 0.15)';
    ctx.lineWidth = 2;
    [50, 150, 250, 350].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, this.height);
      ctx.stroke();
    });

    // Speed Lines Effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 8; i++) {
      const lineY = (Date.now() * 0.4 + i * 90) % this.height;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.width, lineY);
      ctx.stroke();
    }

    // Pickups
    this.pickups.forEach(pk => {
      if (pk.type === 'coin') {
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪙', pk.x, pk.y + 3);
      } else if (pk.type === 'gem') {
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💎', pk.x, pk.y + 3);
      } else {
        ctx.fillStyle = '#A855F7';
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Obstacles
    this.obstacles.forEach(ob => {
      if (ob.type === 'barrier') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.fillRect(ob.x - 36, ob.y - 14, 72, 28);
        ctx.strokeStyle = '#FCA5A5';
        ctx.strokeRect(ob.x - 36, ob.y - 14, 72, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚧 انزلق (SLIDE)', ob.x, ob.y + 4);
      } else if (ob.type === 'spikes') {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(ob.x - 25, ob.y + 15);
        ctx.lineTo(ob.x, ob.y - 15);
        ctx.lineTo(ob.x + 25, ob.y + 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⬆️ اقفز', ob.x, ob.y + 24);
      } else if (ob.type === 'boss_fireball') {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(ob.x, ob.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Enemies
    this.enemies.forEach(en => {
      ctx.fillStyle = en.isElite ? '#7C3AED' : '#DC2626';
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.isElite ? 22 : 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Enemy HP bar
      const hpPct = Math.max(0, en.hp / en.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(en.x - 20, en.y - 28, 40, 5);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(en.x - 20, en.y - 28, 40 * hpPct, 5);
    });

    // Boss
    if (this.boss) {
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(this.boss.x, this.boss.y, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👹 ${this.boss.name}`, this.boss.x, this.boss.y - 50);

      // Boss Top HP Bar
      const bossPct = Math.max(0, this.boss.hp / this.boss.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(40, 50, 320, 14);
      ctx.fillStyle = 'linear-gradient(90deg, #EF4444, #F59E0B)';
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(40, 50, 320 * bossPct, 14);
      ctx.strokeStyle = '#FCA5A5';
      ctx.strokeRect(40, 50, 320, 14);
    }

    // Player Avatar / Character
    ctx.save();
    ctx.translate(this.playerX, this.playerY);

    if (this.isTransformed) {
      // Glowing Aura
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.shieldActive) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = this.char.color || '#00A3FF';
    if (this.isSliding) {
      ctx.fillRect(-22, 0, 44, 20);
    } else {
      ctx.beginPath();
      ctx.arc(0, -6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-14, 0, 28, 22);
    }

    // Face / Mask
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -12, 16, 6);

    ctx.restore();

    // Slashes
    this.slashes.forEach(sl => {
      ctx.save();
      ctx.strokeStyle = sl.color;
      ctx.globalAlpha = sl.alpha;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, sl.radius, sl.angle - 0.7, sl.angle + 0.7);
      ctx.stroke();
      ctx.restore();
    });

    // Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Warning Siren
    if (this.warningActive && this.warningTimer > 0) {
      this.warningTimer--;
      ctx.fillStyle = (Math.floor(Date.now() / 150) % 2 === 0) ? 'rgba(239, 68, 68, 0.3)' : 'transparent';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#EF4444';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ WARNING: BOSS APPROACHING! ⚠️', 200, 240);
    }

    ctx.restore();
  }

  loop(timestamp) {
    if (!this.running) return;
    this.update();
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.AnimeHunterEngine = AnimeHunterEngine;
