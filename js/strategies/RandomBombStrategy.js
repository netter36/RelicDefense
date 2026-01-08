import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';
import { COMBAT_CONFIG } from '../constants.js';

export class RandomBombStrategy extends AttackStrategy {
    update(tower, time) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        
        const path = this.scene.monsterPath;
        let tx = origin.x;
        let ty = origin.y;
        let validTargetFound = false;

        if (path) {
            for(let i = 0; i < 10; i++) {
                const t = Math.random();
                const p = path.getPoint(t);
                const dist = Phaser.Math.Distance.Between(origin.x, origin.y, p.x, p.y);
                
                if (dist <= tower.range) {
                    tx = p.x;
                    ty = p.y;
                    validTargetFound = true;
                    break;
                }
            }
        }

        if (!validTargetFound) {
             const r = Math.sqrt(Math.random()) * tower.range;
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
                
                this.towerSystem.createExplosion(tx, ty, aoe, hit.dmg, hit.crit, tower);
            }
        });
        
        this.postFire(tower, time);
    }
}
