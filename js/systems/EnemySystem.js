import { MONSTER_TYPES } from '../constants.js';

export class EnemySystem {
    constructor(scene, path, uiManager) {
        this.scene = scene;
        this.path = path;
        this.uiManager = uiManager;
        this.monsters = this.scene.physics.add.group();

        // Difficulty & Spawning scale
        this.gameTime = 0;
        this.spawnTimer = 2000;
        this.difficulty = 1.0;
    }

    spawnMonster() {
        const type = this.getWeightedRandomMonster();
        const speedVar = (Math.random() * 0.1) - 0.05;
        const finalSpeed = type.speed * (1 + speedVar);

        const m = this.scene.add.container(0, 0);
        m.setDepth(20);
        const size = type.size || 40;

        const g = this.scene.add.graphics();
        m.add(g);
        this.renderMonsterByType(g, type);

        this.scene.physics.add.existing(m);
        m.body.setCircle(size / 2, -size / 2, -size / 2.5);

        m.t = 0;
        m.speed = finalSpeed;
        m.hp = Math.floor(type.hp * this.difficulty);
        m.maxHp = m.hp;
        m.difficulty = this.difficulty; // Store for valid kill/reward scaling if needed
        m.hpBar = this.scene.add.graphics().setDepth(21);
        m.hpBarWidth = size;
        m.debuffs = []; // Initialize debuffs

        this.updateHPBar(m);
        this.monsters.add(m);
        this.updateMonsterCount();

        // Characteristic animations based on type (Keep existing)
        if (type.id === 'slime') {
            this.scene.tweens.add({ targets: g, scaleY: 0.7, scaleX: 1.2, duration: 400, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });
        } else if (type.id === 'spirit') {
            this.scene.tweens.add({ targets: g, alpha: 0.4, duration: 600, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });
            this.scene.tweens.add({ targets: g, y: -5, duration: 800, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });
        } else if (type.id === 'guardian') {
            this.scene.tweens.add({ targets: g, angle: 5, duration: 1000, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });
        } else if (type.id === 'golem') {
            this.scene.tweens.add({ targets: g, y: -2, duration: 500, yoyo: true, loop: -1, ease: 'Quad.easeInOut' });
        }
    }

    updateMonsterCount() {
        this.uiManager.updateMonsterCount(this.monsters.countActive());
    }

    getWeightedRandomMonster() {
        const totalWeight = MONSTER_TYPES.reduce((sum, t) => sum + (t.weight || 1), 0);
        let r = Math.random() * totalWeight;
        for (const t of MONSTER_TYPES) {
            r -= (t.weight || 1);
            if (r <= 0) return t;
        }
        return MONSTER_TYPES[0];
    }

    update(delta) {
        // Difficulty Logic
        this.gameTime += delta;
        this.difficulty = 1 + (this.gameTime / 60000) * 0.8; // +80% HP per minute

        const baseInterval = 2500;
        const currentInterval = Math.max(400, baseInterval / (1 + (this.difficulty - 1) * 0.6));

        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
            this.spawnMonster();
            this.spawnTimer = currentInterval;
        }

        // Notify UI
        if (this.uiManager.updateDifficultyInfo) {
            this.uiManager.updateDifficultyInfo(this.difficulty, currentInterval, this.gameTime);
        }
        this.monsters.getChildren().forEach(m => {
            if (!m.active) return;

            // Debuff Processing
            if (!m.debuffs) m.debuffs = [];

            let speedMult = 1;
            let isStunned = false;

            for (let i = m.debuffs.length - 1; i >= 0; i--) {
                const d = m.debuffs[i];
                d.duration -= delta;

                if (d.type === 'slow') speedMult *= d.val;
                if (d.type === 'stun') isStunned = true;
                if (d.type === 'poison') {
                    d.tick = (d.tick || 500) - delta;
                    if (d.tick <= 0) {
                        m.hp -= d.val;
                        d.tick = 500;
                        this.updateHPBar(m);

                        // Poison Visual (Green Float)
                        const float = this.scene.add.text(m.x, m.y - 40, `-${d.val}`, { fontSize: '12px', color: '#4ade80', fontStyle: 'bold' }).setOrigin(0.5);
                        this.scene.tweens.add({ targets: float, y: m.y - 60, alpha: 0, duration: 800, onComplete: () => float.destroy() });
                    }
                }

                if (d.duration <= 0) m.debuffs.splice(i, 1);
            }

            if (m.hp <= 0) {
                this.killMonster(m);
                return;
            }

            if (isStunned) speedMult = 0;

            m.t += m.speed * speedMult * (delta / 16);
            if (m.t >= 1) {
                m.t -= 1;
            }

            const p = this.path.getPoint(m.t);
            m.setPosition(p.x, p.y);
            if (m.hpBar) {
                m.hpBar.setPosition(m.x, m.y - 30);
                this.updateHPBar(m);
            }

            // Status Visuals
            if (!m.statusG) {
                m.statusG = this.scene.add.graphics();
                m.add(m.statusG);
            }
            m.statusG.clear();
            const size = m.hpBarWidth || 40;

            if (isStunned) {
                // Stun: Yellow Stroke & Icon
                m.statusG.lineStyle(2, 0xffff00, 1);
                m.statusG.strokeCircle(0, 0, size / 2 + 2);
                // Simple bolt shape
                m.statusG.fillStyle(0xffff00, 1);
                m.statusG.beginPath();
                m.statusG.moveTo(0, -size / 2 - 10);
                m.statusG.lineTo(3, -size / 2 - 5);
                m.statusG.lineTo(-3, -size / 2 - 5);
                m.statusG.closePath();
                m.statusG.fillPath();
            }
            else if (m.debuffs.some(d => d.type === 'poison')) {
                // Poison: Green Bubbles overlay
                m.statusG.fillStyle(0x4ade80, 0.3);
                m.statusG.fillCircle(0, 0, size / 2);
                m.statusG.fillStyle(0x4ade80, 0.8);
                m.statusG.fillCircle(size / 2, -size / 2, 3);
            }
            else if (m.debuffs.some(d => d.type === 'vulnerable')) {
                // Vulnerable: Purple Brackets/Rect/Cracks
                m.statusG.lineStyle(2, 0xa855f7, 0.8);
                const s = size / 2;
                m.statusG.strokeRect(-s - 2, -s - 2, size + 4, size + 4);
            }
            else if (speedMult < 1) {
                // Slow: Blue Aura
                m.statusG.fillStyle(0x3b82f6, 0.2);
                m.statusG.fillCircle(0, 0, size / 2 + 6);
            }
        });
    }

    killMonster(m) {
        if (!m.active) return;
        m.destroy();
        if (m.hpBar) m.hpBar.destroy();
        this.updateMonsterCount();
    }

    updateHPBar(m) {
        if (!m.hpBar) return;
        m.hpBar.clear();
        const w = m.hpBarWidth || 40;
        m.hpBar.fillStyle(0x000000, 0.5); m.hpBar.fillRect(-w / 2, -2, w, 4);
        const r = Math.max(0, m.hp / m.maxHp);
        const color = r < 0.3 ? 0xef4444 : (r < 0.6 ? 0xf59e0b : 0x10b981);
        m.hpBar.fillStyle(color, 1); m.hpBar.fillRect(-w / 2, -2, w * r, 4);
    }

    renderMonsterByType(g, type) {
        const size = type.size;
        const color = type.color;

        if (type.id === 'slime') {
            g.fillStyle(color, 0.8);
            g.fillEllipse(0, 0, size, size * 0.8);
            g.fillStyle(0xffffff, 0.4);
            g.fillCircle(-size / 5, -size / 5, size / 6);
            g.fillStyle(0x000000, 0.2);
            g.fillCircle(0, 5, size / 4);
        }
        else if (type.id === 'guardian') {
            g.lineStyle(3, 0xffffff, 0.5);
            g.fillStyle(color, 1);
            const pts = [0, -size / 2, size / 2, 0, 0, size / 2, -size / 2, 0];
            g.fillPoints(pts.map((p, i) => ({ x: pts[i * 2], y: pts[i * 2 + 1] })), true);
            g.strokePoints(pts.map((p, i) => ({ x: pts[i * 2], y: pts[i * 2 + 1] })), true);
            g.fillStyle(0xfacc15, 1);
            g.fillCircle(0, 0, size / 5);
            g.lineStyle(1, 0xffffff, 1);
            g.strokeCircle(0, 0, size / 5);
            g.lineStyle(2, color, 0.6);
            g.strokeCircle(0, 0, size / 1.5);
        }
        else if (type.id === 'spirit') {
            g.fillStyle(color, 0.6);
            for (let i = 0; i < 4; i++) {
                const offX = (Math.random() - 0.5) * size / 2;
                const offY = (Math.random() - 0.5) * size / 2;
                g.fillCircle(offX, offY, size / 2);
            }
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(0, 0, size / 4);
        }
        else if (type.id === 'golem') {
            g.fillStyle(color, 1);
            g.lineStyle(2, 0x000000, 0.4);
            g.fillRoundedRect(-size / 2.2, -size / 4, size / 1.1, size / 2, 8);
            g.strokeRoundedRect(-size / 2.2, -size / 4, size / 1.1, size / 2, 8);
            g.fillCircle(-size / 2.5, -size / 5, size / 3.5);
            g.strokeCircle(-size / 2.5, -size / 5, size / 3.5);
            g.fillCircle(size / 2.5, -size / 5, size / 3.5);
            g.strokeCircle(size / 2.5, -size / 5, size / 3.5);
            g.fillRoundedRect(-size / 4, -size / 2.2, size / 2, size / 3, 5);
            g.strokeRoundedRect(-size / 4, -size / 2.2, size / 2, size / 3, 5);
            g.lineStyle(1, 0x000000, 0.3);
            g.lineBetween(-size / 4, 0, size / 4, size / 5);
            g.lineBetween(0, -size / 4, -size / 5, size / 4);
            g.fillStyle(0xff0000, 1);
            g.fillCircle(-size / 8, -size / 3, size / 15);
            g.fillCircle(size / 8, -size / 3, size / 15);
            g.fillStyle(0xef4444, 0.3);
            g.fillCircle(0, 0, size / 6);
        }
    }
}
