import { ProjectileStrategy } from './ProjectileStrategy';
import { Tower } from '../types';

export class RapidStrategy extends ProjectileStrategy {
    postFire(tower: Tower, time: number) {
        super.postFire(tower, time);
        tower.burstCounter = (tower.burstCounter || 0) + 1;
        if (tower.burstCounter >= (tower.stats.burstCount || 5)) {
            tower.isReloading = true;
        }
    }
}
