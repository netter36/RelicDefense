import { ProjectileStrategy } from './ProjectileStrategy.js';

export class MultiStrategy extends ProjectileStrategy {
    update(tower, time) {
        if (!this.canFire(tower, time)) return;

        const origin = this.towerSystem.getVisualCenter(tower);
        const count = tower.stats.projectileCount || 3;
        const targets = this.towerSystem.getMultipleMonsters(origin.x, origin.y, tower.range, count);
        
        if (targets.length > 0) {
            targets.forEach(t => this.fire(tower, t, origin, time));
            this.postFire(tower, time);
        }
    }
}
