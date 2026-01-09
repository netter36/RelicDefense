import { ProjectileStrategy } from './ProjectileStrategy';
import { Tower, Monster } from '../types';

export class MultiStrategy extends ProjectileStrategy {
    update(tower: Tower, time: number) {
        if (!this.canFire(tower, time)) return;

        const origin = this.towerSystem.getVisualCenter(tower);
        const count = tower.stats.projectileCount || 3;
        const targets = this.towerSystem.getMultipleMonsters(origin.x, origin.y, tower.range || 250, count);
        
        if (targets.length > 0) {
            targets.forEach((t: Monster) => this.fire(tower, t, origin, time));
            this.postFire(tower, time);
        }
    }
}
