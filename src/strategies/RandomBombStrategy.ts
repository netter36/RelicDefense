import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { COMBAT_CONFIG } from '../constants';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class RandomBombStrategy extends AttackStrategy {
    update(tower: Tower, time: number) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        
        const scene = this.scene as any;
        const path = scene.monsterPath;
        let tx = origin.x;
        let ty = origin.y;
        let validTargetFound = false;
        const range = tower.range || 250;

        if (path) {
            for(let i = 0; i < 10; i++) {
                const t = Math.random();
                const p = path.getPoint(t);
                const dist = Phaser.Math.Distance.Between(origin.x, origin.y, p.x, p.y);
                
                if (dist <= range) {
                    tx = p.x;
                    ty = p.y;
                    validTargetFound = true;
                    break;
                }
            }
        }

        if (!validTargetFound) {
             const r = Math.sqrt(Math.random()) * range;
             const theta = Math.random() * 2 * Math.PI;
             tx = origin.x + r * Math.cos(theta);
             ty = origin.y + r * Math.sin(theta);
        }
        
        const proj = RenderUtils.createProjectile(this.scene, origin.x, origin.y, null, tower);
        proj.setScale(1.5);
        
        const duration = 600;
        
        this.scene.tweens.add({
            targets: proj,
            x: tx,
            y: ty,
            duration: duration,
            ease: 'Linear'
        });
        
        this.scene.tweens.add({
            targets: proj,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: duration / 2,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                RenderUtils.destroyProjectile(proj);
                
                const hit = this.towerSystem.calculateDamage(tower);
                const aoe = tower.stats.aoeRadius || COMBAT_CONFIG.BOMB_RADIUS;
                
                this.towerSystem.createExplosion(tx, ty, aoe, hit.dmg, !!hit.crit, tower);
            }
        });
        
        this.postFire(tower, time);
    }
}
