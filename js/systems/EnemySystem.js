import { MONSTER_TYPES } from '../constants.js';

export class EnemySystem {
    constructor(scene, path, uiManager) {
        this.scene = scene;
        this.path = path;
        this.uiManager = uiManager;
        this.monsters = this.scene.physics.add.group();
    }

    spawnMonster() {
        const type = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
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

        m.t = 0; m.speed = finalSpeed; m.hp = type.hp; m.maxHp = type.hp;
        m.hpBar = this.scene.add.graphics().setDepth(21);
        m.hpBarWidth = size;

        this.updateHPBar(m);
        this.monsters.add(m);
        this.updateMonsterCount();

        // Characteristic animations based on type
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

    update(delta) {
        this.monsters.getChildren().forEach(m => {
            m.t += m.speed * (delta / 16);
            if (m.t >= 1) {
                m.destroy(); if (m.hpBar) m.hpBar.destroy();
                this.updateMonsterCount();
                return;
            }
            const p = this.path.getPoint(m.t);
            m.setPosition(p.x, p.y);
            if (m.hpBar) {
                m.hpBar.setPosition(m.x, m.y - 30);
                this.updateHPBar(m);
            }
        });
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
