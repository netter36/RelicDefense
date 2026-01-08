import { ProjectileStrategy } from './ProjectileStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';
import { COMBAT_CONFIG } from '../constants.js';

export class BombStrategy extends ProjectileStrategy {
    fire(tower, target, origin, time) {
        const startX = origin.x;
        const startY = origin.y;
        const proj = RenderUtils.createProjectile(this.scene, startX, startY, target, tower);
        proj.setScale(1.5);

        this.scene.tweens.add({
            targets: proj,
            x: target.x,
            y: target.y,
            duration: 400,
            onComplete: () => {
                const hitX = target.active ? target.x : proj.x;
                const hitY = target.active ? target.y : proj.y;
                RenderUtils.destroyProjectile(proj);
                
                const hit = this.towerSystem.calculateDamage(tower);
                const aoe = tower.stats.aoeRadius || COMBAT_CONFIG.BOMB_RADIUS;
                
                this.towerSystem.createExplosion(hitX, hitY, aoe, hit.dmg, hit.crit, tower);
            }
        });
    }
}
