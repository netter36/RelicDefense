import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class TrapStrategy extends AttackStrategy {
    update(tower: Tower, time: number) {
        // Trap cooldown logic is slightly different, it checks activeTraps count
        // But also fireRate? TowerSystem used `fireTrap` which checked activeTraps.
        // It didn't seem to check `lastFire` in the same way? 
        // Wait, `TowerSystem` line 93 checks `time - tower.lastFire < requiredDelay`.
        // So it IS rate limited.
        
        if (!this.canFire(tower, time)) return;

        if (!tower.activeTraps) tower.activeTraps = 0;
        const maxTraps = tower.stats.maxTraps || 5;
        if (tower.activeTraps >= maxTraps) return;

        const scene = this.scene as any;
        const path = scene.monsterPath;
        if (!path) return;

        let bestPoint = null;
        for(let i=0; i<10; i++) {
            const t = Math.random();
            const p = path.getPoint(t);
            const origin = this.towerSystem.getVisualCenter(tower);
            const dist = Phaser.Math.Distance.Between(origin.x, origin.y, p.x, p.y);
            
            if (dist <= (tower.range || 250)) {
                bestPoint = p;
                break;
            }
        }

        if (bestPoint) {
            const mine = RenderUtils.createMine(this.scene, bestPoint.x, bestPoint.y, RenderUtils.getProjectileColor(tower)) as any;
            mine.towerId = tower.id;
            mine.sourceTower = tower;
            mine.damage = this.towerSystem.calculateDamage(tower);
            mine.aoeRadius = tower.stats.aoeRadius || 120;
            mine.spawnTime = time;
            mine.duration = tower.stats.duration || 15000;
            
            this.towerSystem.traps.add(mine);
            tower.activeTraps++;
            this.postFire(tower, time);
        }
    }
}
