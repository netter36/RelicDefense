import { COMBAT_CONFIG, UI_CONFIG, SLOT_SIZE } from '../constants.js';
import { ATTACK_TYPES } from '../types.js';
import { RenderUtils } from '../utils/RenderUtils.js';

import { ProjectileStrategy } from '../strategies/ProjectileStrategy.js';
import { RapidStrategy } from '../strategies/RapidStrategy.js';
import { MultiStrategy } from '../strategies/MultiStrategy.js';
import { ChainStrategy } from '../strategies/ChainStrategy.js';
import { LaserStrategy } from '../strategies/LaserStrategy.js';
import { NovaStrategy } from '../strategies/NovaStrategy.js';
import { OrbitStrategy } from '../strategies/OrbitStrategy.js';
import { BeamStrategy } from '../strategies/BeamStrategy.js';
import { RicochetStrategy } from '../strategies/RicochetStrategy.js';
import { TrapStrategy } from '../strategies/TrapStrategy.js';
import { BombStrategy } from '../strategies/BombStrategy.js';
import { RandomBombStrategy } from '../strategies/RandomBombStrategy.js';

export class TowerSystem {
    constructor(scene, effectManager) {
        this.scene = scene;
        this.effectManager = effectManager;
        this.traps = this.scene.add.group();

        this.strategies = {
            [ATTACK_TYPES.NORMAL]: new ProjectileStrategy(this),
            [ATTACK_TYPES.RAPID]: new RapidStrategy(this),
            [ATTACK_TYPES.MULTI]: new MultiStrategy(this),
            [ATTACK_TYPES.CHAIN]: new ChainStrategy(this),
            [ATTACK_TYPES.LASER]: new LaserStrategy(this),
            [ATTACK_TYPES.NOVA]: new NovaStrategy(this),
            [ATTACK_TYPES.ORBIT]: new OrbitStrategy(this),
            [ATTACK_TYPES.BEAM]: new BeamStrategy(this),
            [ATTACK_TYPES.RICOCHET]: new RicochetStrategy(this),
            [ATTACK_TYPES.TRAP]: new TrapStrategy(this),
            [ATTACK_TYPES.BOMB]: new BombStrategy(this),
            [ATTACK_TYPES.RANDOM_BOMB]: new RandomBombStrategy(this)
        };
    }

    update(time, placedItems) {
        this.updateTraps(time);

        placedItems.forEach(tower => {
            if (tower.type !== 'artifact' || !tower.el) return;

            const at = tower.stats.attackType || ATTACK_TYPES.NORMAL;
            const strategy = this.strategies[at] || this.strategies[ATTACK_TYPES.NORMAL];
            
            strategy.update(tower, time);
        });
    }

    cleanupTower(tower) {
        const at = tower.stats.attackType || ATTACK_TYPES.NORMAL;
        const strategy = this.strategies[at];
        if (strategy) {
            strategy.cleanup(tower);
        }
    }

    getVisualCenter(tower) {
        if (!tower.shape) return { x: tower.x, y: tower.y };

        const topLeftX = tower.x - (tower.width * SLOT_SIZE) / 2;
        const topLeftY = tower.y - (tower.height * SLOT_SIZE) / 2;

        let totalX = 0;
        let totalY = 0;
        let count = 0;

        tower.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === 1) {
                    const cellCenterX = topLeftX + colIndex * SLOT_SIZE + SLOT_SIZE / 2;
                    const cellCenterY = topLeftY + rowIndex * SLOT_SIZE + SLOT_SIZE / 2;
                    totalX += cellCenterX;
                    totalY += cellCenterY;
                    count++;
                }
            });
        });

        if (count === 0) return { x: tower.x, y: tower.y };

        return {
            x: totalX / count,
            y: totalY / count
        };
    }

    calculateDamage(tower) {
        let dmg = (tower.currentAtk || tower.stats.atk);
        const crit = (tower.critChance && Math.random() < tower.critChance);
        if (crit) {
            const mult = tower.critDmgMult || COMBAT_CONFIG.CRIT_DAMAGE_MULT;
            dmg *= mult;
        }
        return { dmg, crit };
    }

    applyDamage(target, dmg, isCrit, tower) {
        if (!target.active) return;
        
        if (this.effectManager) {
            this.effectManager.showDamageText(target.x, target.y, dmg, isCrit);
        }
        
        if (this.scene.enemySystem && this.scene.enemySystem.takeDamage) {
            this.scene.enemySystem.takeDamage(target, dmg, isCrit);
        } else {
            target.hp -= dmg;
            this.scene.updateHPBar(target);
            if (target.hp <= 0) {
                target.destroy();
                this.scene.updateMonsterCount();
            }
        }

        if (tower && tower.stats && tower.stats.debuff) {
            this.applyDebuff(target, tower.stats.debuff, tower.debuffEfficiency);
        }
    }

    applyTowerDamageLogic(tower, target, dmgMultiplier = 1) {
        if (!target.active) return;

        const hit = this.calculateDamage(tower);
        let dmg = hit.dmg * dmgMultiplier;

        if (target.debuffs && target.debuffs.some(d => d.type === 'vulnerable')) dmg *= COMBAT_CONFIG.VULNERABLE_MULT;

        if (tower.activeSynergy === '그림자의 시너지' || tower.executeThreshold) {
            const hpPercent = target.hp / target.maxHp;
            const threshold = tower.executeThreshold || 0.3;
            if (hpPercent <= threshold) {
                dmg *= 2;
                RenderUtils.showFloatingText(this.scene, target.x, target.y, "EXECUTE!", '#a855f7');
            }
        }

        this.applyDamage(target, dmg, hit.crit, tower);

        if (tower.activeSynergy === '신비의 시너지' || (tower.pierceCount && tower.pierceCount > 0)) {
            const pierceRange = 150;
            if (this.scene.enemySystem) {
                const others = this.scene.enemySystem.monsters.getChildren().filter(m =>
                    m !== target && m.active &&
                    Phaser.Math.Distance.Between(m.x, m.y, target.x, target.y) <= pierceRange
                );

                let pierced = 0;
                const maxPierce = tower.pierceCount || 1;
                
                const originX = tower.el ? tower.el.x : tower.x;
                const originY = tower.el ? tower.el.y : tower.y;
                const angle = Phaser.Math.Angle.Between(originX, originY, target.x, target.y);

                others.forEach(m => {
                    if (pierced >= maxPierce) return;
                    const angleToM = Phaser.Math.Angle.Between(target.x, target.y, m.x, m.y);
                    const diff = Math.abs(Phaser.Math.Angle.Wrap(angle - angleToM));
                    if (diff < 0.5) { 
                        this.applyDamage(m, dmg * 0.7, hit.crit, tower);
                        RenderUtils.showHitEffect(this.scene, m.x, m.y, RenderUtils.getProjectileColor(tower));
                        pierced++;
                    }
                });
            }
        }
    }

    createExplosion(x, y, radius, damage, isCrit, tower) {
        if (this.effectManager) this.effectManager.createExplosion(x, y, radius, 0xffaa00);

        if (this.scene.monsters) {
            this.scene.monsters.getChildren().forEach(m => {
                if (!m.active) return;
                const d = Phaser.Math.Distance.Between(x, y, m.x, m.y);
                if (d <= radius) {
                    this.applyDamage(m, damage, isCrit, tower);
                    
                    if (tower && (tower.element === 'plasma' || tower.activeSynergy === '플라즈마 시너지')) {
                        if (this.scene.enemySystem && this.scene.enemySystem.applyKnockback) {
                             const force = 10;
                             this.scene.enemySystem.applyKnockback(m, x, y, force);
                        }
                    }
                }
            });
        }
    }

    updateTraps(time) {
        this.traps.getChildren().forEach(mine => {
            if (!mine.active) return;

            if (time - mine.spawnTime > mine.duration) {
                this.destroyMine(mine);
                return;
            }

            let hit = false;
            if (this.scene.monsters) {
                this.scene.monsters.getChildren().some(m => {
                    if (!m.active) return false;
                    const dist = Phaser.Math.Distance.Between(mine.x, mine.y, m.x, m.y);
                    if (dist < 30) { 
                        hit = true;
                        return true;
                    }
                    return false;
                });
            }

            if (hit) {
                this.createExplosion(mine.x, mine.y, mine.aoeRadius, mine.damage.dmg, mine.damage.crit, mine.sourceTower);
                this.destroyMine(mine);
            }
        });
    }

    destroyMine(mine) {
        if (mine.sourceTower && mine.sourceTower.activeTraps > 0) {
            mine.sourceTower.activeTraps--;
        }
        mine.destroy();
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

    getMultipleMonsters(x, y, range, count) {
        if (!this.scene.monsters) return [];
        const inRange = this.scene.monsters.getChildren().filter(m => {
            return m.active && Phaser.Math.Distance.Between(x, y, m.x, m.y) <= range;
        });
        inRange.sort((a, b) => {
            const dA = Phaser.Math.Distance.Between(x, y, a.x, a.y);
            const dB = Phaser.Math.Distance.Between(x, y, b.x, b.y);
            return dA - dB;
        });
        return inRange.slice(0, count);
    }

    applyDebuff(target, debuff, efficiency = 1) {
        if (!debuff || !target.active || !target.debuffs) return;
        if (debuff.chance && Math.random() > debuff.chance) return;

        let d = { ...debuff };
        if (d.type === 'slow' && efficiency > 1) {
            d.val = 1 - (1 - d.val) * efficiency;
            if (d.val < 0.1) d.val = 0.1;
        }

        const existing = target.debuffs.find(e => e.type === d.type);
        if (existing) {
            existing.duration = d.duration;
            if (d.type === 'slow' && d.val < existing.val) { existing.val = d.val; target.isStatusDirty = true; }
            if (d.type === 'vulnerable' && d.val > existing.val) { existing.val = d.val; target.isStatusDirty = true; }
        } else {
            target.debuffs.push({ ...d, tick: 0 });
            target.isStatusDirty = true;
        }
    }
}
