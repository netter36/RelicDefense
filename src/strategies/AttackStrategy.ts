import Phaser from 'phaser';
import { TowerSystem } from '../systems/TowerSystem';
import { EffectManager } from '../managers/EffectManager';
import { Tower, Monster } from '../types';

export class AttackStrategy {
    towerSystem: TowerSystem;
    scene: Phaser.Scene;
    effectManager: EffectManager;

    constructor(towerSystem: TowerSystem) {
        this.towerSystem = towerSystem;
        this.scene = towerSystem.scene;
        this.effectManager = towerSystem.effectManager;
    }

    update(tower: Tower, time: number) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        const target = this.findTarget(tower, origin);
        
        if (target) {
            this.fire(tower, target, origin, time);
            this.postFire(tower, time);
        }
    }

    canFire(tower: Tower, time: number): boolean {
        let requiredDelay = tower.currentFireRate || 1000;
        if (tower.isReloading) {
            requiredDelay = tower.stats.reloadTime || 1500;
        }

        if (time - (tower.lastFire || 0) < requiredDelay) return false;

        if (tower.isReloading) {
            tower.isReloading = false;
            tower.burstCounter = 0;
        }
        return true;
    }

    findTarget(tower: Tower, origin: {x: number, y: number}): Monster | null {
        return this.towerSystem.getNearestMonster(origin.x, origin.y, tower.range || 250);
    }

    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
        // Override me
    }

    postFire(tower: Tower, time: number) {
        tower.lastFire = time;
    }

    cleanup(tower: Tower) {
        // Override me if needed
    }
}
