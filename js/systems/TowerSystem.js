import { ATTACK_TYPES, COMBAT_CONFIG, UI_CONFIG } from '../constants.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class TowerSystem {
    constructor(scene) {
        this.scene = scene;
    }

    calculateDamage(tower) {
        let dmg = (tower.currentAtk || tower.stats.atk);
        const crit = (tower.critChance && Math.random() < tower.critChance);
        if (crit) dmg *= COMBAT_CONFIG.CRIT_DAMAGE_MULT;
        return { dmg, crit };
    }

    showDamageText(x, y, damage, isCrit) {
        const val = Math.round(damage);
        if (val <= 0) return;

        const style = isCrit
            ? { fontSize: '20px', color: '#dc2626', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3 }
            : { fontSize: '14px', color: '#ffffff', stroke: '#000', strokeThickness: 2 };

        const textStr = isCrit ? `! ${val} !` : `${val}`;
        const txt = this.scene.add.text(x, y - 20, textStr, style).setOrigin(0.5);
        txt.setDepth(100);

        this.scene.tweens.add({
            targets: txt,
            y: y - 50 - Math.random() * 20,
            x: x + (Math.random() * 30 - 15),
            alpha: 0,
            scaleX: isCrit ? 1.2 : 1.0,
            scaleY: isCrit ? 1.2 : 1.0,
            duration: isCrit ? UI_CONFIG.CRIT_TEXT_DURATION : UI_CONFIG.DAMAGE_TEXT_DURATION,
            ease: 'Back.out',
            onComplete: () => txt.destroy()
        });
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

        // Damage & Effect
        // Damage & Effect
        const hit = this.calculateDamage(tower);
        let dmg = hit.dmg;
        if (target.debuffs && target.debuffs.some(d => d.type === 'vulnerable')) dmg *= COMBAT_CONFIG.VULNERABLE_MULT;

        if (hit.crit) {
            this.showDamageText(target.x, target.y, dmg, true);
        } else {
            this.showDamageText(target.x, target.y, dmg, false);
        }

        target.hp -= dmg;
        this.applyDebuff(target, tower.stats.debuff, tower.debuffEfficiency);
        this.createHitEffect(target.x, target.y, tower.element);

        this.scene.updateHPBar(target);
        if (target.hp <= 0) {
            if (this.scene.enemySystem) this.scene.enemySystem.killMonster(target);
            else { target.destroy(); this.scene.updateMonsterCount(); }
        }

        if (jumps > 1) {
            // Find next target from CURRENT target pos
            const range = COMBAT_CONFIG.CHAIN_JUMP_RANGE; // Chain jump range
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
            if (exclude.includes(m) || !m.active) return;
            const d = Phaser.Math.Distance.Between(x, y, m.x, m.y);
            if (d < minDist) {
                minDist = d;
                nearest = m;
            }
        });
        return nearest;
    }

    applyDebuff(target, debuff, efficiency = 1) {
        if (!debuff || !target.active || !target.debuffs) return;
        if (debuff.chance && Math.random() > debuff.chance) return;

        let d = { ...debuff };
        // Apply Efficiency (Ice Synergy)
        if (d.type === 'slow' && efficiency > 1) {
            d.val = 1 - (1 - d.val) * efficiency;
            if (d.val < 0.1) d.val = 0.1;
        }

        const existing = target.debuffs.find(e => e.type === d.type);
        if (existing) {
            existing.duration = d.duration;
            if (d.type === 'slow' && d.val < existing.val) existing.val = d.val;
            if (d.type === 'vulnerable' && d.val > existing.val) existing.val = d.val;
        } else {
            target.debuffs.push({ ...d, tick: 0 });
        }
    }

    createHitEffect(x, y, element) {
        RenderUtils.createHitEffect(this.scene, x, y, element);
    }

    fireProjectile(tower, target) {
        if (!target || !target.active) return;

        const proj = RenderUtils.createProjectile(this.scene, tower.x, tower.y, tower.element);

        const spread = 20;
        const tx = target.x + (Math.random() * spread - spread / 2);
        const ty = target.y + (Math.random() * spread - spread / 2);

        this.scene.tweens.add({
            targets: proj,
            x: tx,
            y: ty,
            duration: 200,
            onComplete: () => {
                proj.destroy();
                // Check distance to actual target to see if it 'hit'? 
                // Since it's homing-ish (short duration), we assume hit if target active.
                // But visual spread shouldn't affect damage logic for now unless requested.
                if (target.active) {
                    const hit = this.calculateDamage(tower);
                    let dmg = hit.dmg;

                    if (target.debuffs && target.debuffs.some(d => d.type === 'vulnerable')) dmg *= COMBAT_CONFIG.VULNERABLE_MULT;

                    this.showDamageText(target.x, target.y, dmg, hit.crit);

                    target.hp -= dmg;
                    this.scene.updateHPBar(target);
                    this.applyDebuff(target, tower.stats.debuff, tower.debuffEfficiency);
                    this.createHitEffect(target.x, target.y, tower.element);

                    if (target.hp <= 0) {
                        if (this.scene.enemySystem) this.scene.enemySystem.killMonster(target);
                        else { target.destroy(); this.scene.updateMonsterCount(); }
                    }
                }
            }
        });
    }

    fireLaser(tower, target) {
        const colors = { fire: 0xff5555, ice: 0x33ddff, thunder: 0xffeb3b, leaf: 0x4caf50, gem: 0xe040fb };
        const color = colors[tower.element] || 0xef4444;

        const laser = this.scene.add.graphics();
        laser.setDepth(25);
        laser.lineStyle(tower.element === 'gem' ? 6 : 4, color, tower.element === 'gem' ? 0.6 : 1);
        laser.lineBetween(tower.x, tower.y, target.x, target.y);

        this.scene.time.delayedCall(80, () => laser.destroy());

        const hit = this.calculateDamage(tower);
        let dmg = hit.dmg * COMBAT_CONFIG.LASER_DAMAGE_MULT; // Laser ticks often
        if (target.debuffs && target.debuffs.some(d => d.type === 'vulnerable')) dmg *= COMBAT_CONFIG.VULNERABLE_MULT;

        if (Math.random() < 0.3) this.showDamageText(target.x, target.y, dmg, hit.crit);

        target.hp -= dmg;
        this.applyDebuff(target, tower.stats.debuff, tower.debuffEfficiency);
        this.createHitEffect(target.x, target.y, tower.element); // Might be too sparky for laser? Maybe reduce chance.

        this.scene.updateHPBar(target);
        if (target.hp <= 0) {
            if (this.scene.enemySystem) this.scene.enemySystem.killMonster(target);
            else { target.destroy(); this.scene.updateMonsterCount(); }
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
                    const hit = this.calculateDamage(tower);
                    let dmg = hit.dmg;
                    if (m.debuffs && m.debuffs.some(d => d.type === 'vulnerable')) dmg *= COMBAT_CONFIG.VULNERABLE_MULT;
                    this.showDamageText(m.x, m.y, dmg, hit.crit);
                    this.damageMonster(m, dmg);
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
                const hit = this.calculateDamage(tower);
                this.createExplosion(hitX, hitY, tower.stats.aoeRadius || COMBAT_CONFIG.BOMB_RADIUS, hit.dmg, hit.crit);
            }
        });
    }

    createExplosion(x, y, radius, damage, isCrit) {
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
                    let finalDmg = damage;
                    if (m.debuffs && m.debuffs.some(d => d.type === 'vulnerable')) finalDmg *= COMBAT_CONFIG.VULNERABLE_MULT;
                    this.showDamageText(m.x, m.y, finalDmg, isCrit);
                    this.damageMonster(m, finalDmg);
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
