import { ATTACK_TYPES } from '../constants.js';

export class TowerSystem {
    constructor(scene) {
        this.scene = scene;
    }

    update(time, placedItems) {
        placedItems.forEach(tower => {
            if (tower.type !== 'artifact' || !tower.el) return;

            // Determine required delay based on state (Reloading vs Normal Fire)
            let requiredDelay = tower.currentFireRate;
            if (tower.isReloading) {
                requiredDelay = tower.stats.reloadTime || 1500;
            }

            if (time - tower.lastFire < requiredDelay) return;

            // If we passed the check and were reloading, we are now done reloading
            if (tower.isReloading) {
                tower.isReloading = false;
                tower.burstCounter = 0;
            }

            const at = tower.stats.attackType;

            if (at === ATTACK_TYPES.RAPID) {
                // Burst Fire Logic
                const target = this.getNearestMonster(tower.x, tower.y, tower.range);
                if (target) {
                    this.fireProjectile(tower, target);
                    tower.lastFire = time;

                    tower.burstCounter = (tower.burstCounter || 0) + 1;
                    if (tower.burstCounter >= (tower.stats.burstCount || 5)) {
                        tower.isReloading = true;
                    }
                }
            } else if (at === ATTACK_TYPES.MULTI) {
                // Multi-Target Logic
                const count = tower.stats.projectileCount || 3;
                const targets = this.getMultipleMonsters(tower.x, tower.y, tower.range, count);
                if (targets.length > 0) {
                    targets.forEach(t => this.fireProjectile(tower, t));
                    tower.lastFire = time;
                }
            } else if (at === ATTACK_TYPES.CHAIN) {
                const target = this.getNearestMonster(tower.x, tower.y, tower.range);
                if (target) {
                    const chainCount = tower.stats.chainCount || 3;
                    this.fireChain(tower, target, chainCount, []);
                    tower.lastFire = time;
                }
            } else {
                // Single Target Logic
                const target = this.getNearestMonster(tower.x, tower.y, tower.range);
                if (target) {
                    if (at === ATTACK_TYPES.LASER) this.fireLaser(tower, target);
                    else if (at === ATTACK_TYPES.NOVA) this.fireNova(tower);
                    else if (at === ATTACK_TYPES.BOMB) this.fireBomb(tower, target);
                    else this.fireProjectile(tower, target);
                    tower.lastFire = time;
                }
            }
        });
    }

    getMultipleMonsters(x, y, range, count) {
        if (!this.scene.monsters) return [];
        const inRange = this.scene.monsters.getChildren().filter(m => {
            return m.active && Phaser.Math.Distance.Between(x, y, m.x, m.y) <= range;
        });
        // Sort by distance
        inRange.sort((a, b) => {
            const dA = Phaser.Math.Distance.Between(x, y, a.x, a.y);
            const dB = Phaser.Math.Distance.Between(x, y, b.x, b.y);
            return dA - dB;
        });
        return inRange.slice(0, count);
    }

    fireChain(tower, target, jumpsRemaining, hitList) {
        if (!target || !target.active || jumpsRemaining <= 0) return;
        hitList.push(target);

        // Visual
        // For first jump, start from tower. For others, start from previous target (which is not passed easily unless we refactor).
        // Let's simplified: This function handles ONE hit.

        // Wait, standard chain lightning usually is: Tower -> A -> B -> C
        // I need to know source position.

        // Refactored recursive approach:
        // Actually, let's just launch a "Chain Projectile" that does the logic on impact?
        // Or simpler: Immediate effect with delayed visuals.

        // Let's do recursive immediate function
        this._processChainLink(tower.x, tower.y, target, jumpsRemaining, hitList, tower);
    }

    _processChainLink(startX, startY, target, jumps, hitList, tower) {
        if (!target || !target.active) return;

        // Visual
        const bolt = this.scene.add.graphics();
        bolt.setDepth(30);
        bolt.lineStyle(2, 0x6366f1, 1);
        bolt.lineBetween(startX, startY, target.x, target.y);
        this.scene.tweens.add({ targets: bolt, alpha: 0, duration: 200, onComplete: () => bolt.destroy() });

        // Damage
        target.hp -= (tower.currentAtk || tower.stats.atk);
        this.scene.updateHPBar(target);
        if (target.hp <= 0) {
            if (target.hpBar) target.hpBar.destroy();
            target.destroy();
            this.scene.updateMonsterCount();
            // If target dies, we can still chain from its last death position? Yes.
        }

        if (jumps > 1) {
            // Find next target from CURRENT target pos
            const range = 200; // Chain jump range
            const next = this.getNearestMonster(target.x, target.y, range, hitList); // Need exclude list
            if (next) {
                this.scene.time.delayedCall(100, () => {
                    this._processChainLink(target.x, target.y, next, jumps - 1, hitList.concat([next]), tower);
                });
            }
        }
    }

    getNearestMonster(x, y, range, exclude = []) {
        let nearest = null;
        let minDist = range;
        if (!this.scene.monsters) return null;
        this.scene.monsters.getChildren().forEach(m => {
            if (exclude.includes(m)) return;
            const d = Phaser.Math.Distance.Between(x, y, m.x, m.y);
            if (d < minDist) {
                minDist = d;
                nearest = m;
            }
        });
        return nearest;
    }

    fireProjectile(tower, target) {
        if (!target || !target.active) return;

        const proj = this.scene.add.circle(tower.x, tower.y, 5, 0xffeb3b);
        proj.setDepth(25);
        this.scene.physics.add.existing(proj);

        this.scene.tweens.add({
            targets: proj,
            x: target.x,
            y: target.y,
            duration: 200,
            onComplete: () => {
                proj.destroy();
                if (target.active) {
                    target.hp -= (tower.currentAtk || tower.stats.atk);
                    this.scene.updateHPBar(target);
                    if (target.hp <= 0) {
                        if (target.hpBar) target.hpBar.destroy();
                        target.destroy();
                        this.scene.updateMonsterCount();
                    }
                }
            }
        });
    }

    fireLaser(tower, target) {
        const laser = this.scene.add.graphics();
        laser.setDepth(25);
        laser.lineStyle(4, 0xef4444, 1);
        laser.lineBetween(tower.x, tower.y, target.x, target.y);

        this.scene.time.delayedCall(100, () => laser.destroy());

        target.hp -= (tower.currentAtk || tower.stats.atk) * 0.1;
        this.scene.updateHPBar(target);
        if (target.hp <= 0) {
            if (target.hpBar) target.hpBar.destroy();
            target.destroy();
            this.scene.updateMonsterCount();
        }
    }

    fireNova(tower) {
        // Visual Effect
        const ring = this.scene.add.circle(tower.x, tower.y, 10, 0x3b82f6, 0.3);
        ring.setDepth(25);
        this.scene.tweens.add({
            targets: ring,
            radius: tower.range || 250,
            alpha: 0,
            duration: 400,
            onComplete: () => ring.destroy()
        });

        // Immediate Damage Logic (Circular area around TOWER)
        if (this.scene.monsters) {
            this.scene.monsters.getChildren().forEach(m => {
                if (!m.active) return;
                const dist = Phaser.Math.Distance.Between(tower.x, tower.y, m.x, m.y);
                if (dist <= (tower.range || 250)) {
                    this.damageMonster(m, tower.currentAtk || tower.stats.atk);
                }
            });
        }
    }

    fireBomb(tower, target) {
        const bomb = this.scene.add.circle(tower.x, tower.y, 8, 0xff0000);
        this.scene.physics.add.existing(bomb);

        this.scene.tweens.add({
            targets: bomb,
            x: target.x,
            y: target.y,
            duration: 400,
            onComplete: () => {
                bomb.destroy();
                // Explode at target location (last known or projected?)
                // Simple: Explode at target's current position if alive, else bomb's position
                const hitX = target.active ? target.x : bomb.x;
                const hitY = target.active ? target.y : bomb.y;
                this.createExplosion(hitX, hitY, tower.stats.aoeRadius || 150, tower.currentAtk || tower.stats.atk);
            }
        });
    }

    createExplosion(x, y, radius, damage) {
        // Visual
        const blast = this.scene.add.circle(x, y, 10, 0xffaa00, 0.6);
        blast.setDepth(25);
        this.scene.tweens.add({
            targets: blast,
            radius: radius,
            alpha: 0,
            duration: 300,
            onComplete: () => blast.destroy()
        });

        // Damage
        if (this.scene.monsters) {
            this.scene.monsters.getChildren().forEach(m => {
                if (!m.active) return;
                if (Phaser.Math.Distance.Between(x, y, m.x, m.y) <= radius) {
                    this.damageMonster(m, damage);
                }
            });
        }
    }

    damageMonster(monster, damage) {
        monster.hp -= damage;
        this.scene.updateHPBar(monster);
        if (monster.hp <= 0) {
            if (monster.hpBar) monster.hpBar.destroy();
            monster.destroy();
            this.scene.updateMonsterCount();
        }
    }
}
