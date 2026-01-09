import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class RicochetStrategy extends AttackStrategy {
    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
        const bounces = tower.stats.ricochetCount || 3;
        this.fireRicochet(tower, target, bounces, [], origin);
    }

    fireRicochet(tower: Tower, target: Monster, bounces: number, hitList: Monster[], origin: {x: number, y: number} | null) {
        if (!target || !target.active || bounces < 0) return;
        hitList.push(target);

        const startX = origin ? origin.x : tower.x;
        const startY = origin ? origin.y : tower.y;
        
        const proj = RenderUtils.createProjectile(this.scene, startX, startY, target, tower);
        
        // Manual rotation update to support timeScale
        const rotationSpeed = 1.2; // degrees per ms
        const updateRotation = (time: number, delta: number) => {
            if (!proj.active) {
                this.scene.events.off('update', updateRotation);
                return;
            }
            proj.angle += rotationSpeed * delta * this.scene.time.timeScale;
        };
        this.scene.events.on('update', updateRotation);

        const dist = Phaser.Math.Distance.Between(startX, startY, target.x, target.y);
        const duration = (dist / 600) * 1000;

        this.scene.tweens.add({
            targets: proj,
            x: target.x,
            y: target.y,
            duration: Math.max(100, duration),
            onComplete: () => {
                this.scene.events.off('update', updateRotation);
                RenderUtils.destroyProjectile(proj);
                if (target.active) {
                    const hit = this.towerSystem.calculateDamage(tower);
                    this.towerSystem.applyDamage(target, hit.dmg, !!hit.crit, tower);
                    RenderUtils.showHitEffect(this.scene, target.x, target.y, RenderUtils.getProjectileColor(tower));

                    if (bounces > 0) {
                        const range = 250;
                        const next = this.towerSystem.getNearestMonster(target.x, target.y, range, hitList);
                        if (next) {
                            this.fireRicochet(tower, next, bounces - 1, hitList, {x: target.x, y: target.y});
                        }
                    }
                }
            }
        });
    }
}
