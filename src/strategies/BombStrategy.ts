import { ProjectileStrategy } from './ProjectileStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { COMBAT_CONFIG } from '../constants';
import { Tower, Monster } from '../types';

export class BombStrategy extends ProjectileStrategy {
    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
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
                
                this.towerSystem.createExplosion(hitX, hitY, aoe, hit.dmg, !!hit.crit, tower);
            }
        });
    }
}
