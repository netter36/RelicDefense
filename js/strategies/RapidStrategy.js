import { ProjectileStrategy } from './ProjectileStrategy.js';

export class RapidStrategy extends ProjectileStrategy {
    postFire(tower, time) {
        super.postFire(tower, time);
        tower.burstCounter = (tower.burstCounter || 0) + 1;
        if (tower.burstCounter >= (tower.stats.burstCount || 5)) {
            tower.isReloading = true;
        }
    }
}
