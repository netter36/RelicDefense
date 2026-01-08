export class AttackStrategy {
    constructor(towerSystem) {
        this.towerSystem = towerSystem;
        this.scene = towerSystem.scene;
        this.effectManager = towerSystem.effectManager;
    }

    update(tower, time) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        const target = this.findTarget(tower, origin);
        
        if (target) {
            this.fire(tower, target, origin, time);
            this.postFire(tower, time);
        }
    }

    canFire(tower, time) {
        let requiredDelay = tower.currentFireRate;
        if (tower.isReloading) {
            requiredDelay = tower.stats.reloadTime || 1500;
        }

        if (time - tower.lastFire < requiredDelay) return false;

        if (tower.isReloading) {
            tower.isReloading = false;
            tower.burstCounter = 0;
        }
        return true;
    }

    findTarget(tower, origin) {
        return this.towerSystem.getNearestMonster(origin.x, origin.y, tower.range);
    }

    fire(tower, target, origin, time) {
        // Override me
    }

    postFire(tower, time) {
        tower.lastFire = time;
    }

    cleanup(tower) {
        // Override me if needed
    }
}
