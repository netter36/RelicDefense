import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class NovaStrategy extends AttackStrategy {
    update(tower, time) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        const radius = tower.range || 250;
        
        if (this.effectManager) {
            this.effectManager.drawNova(origin.x, origin.y, radius);
        }

        if (this.scene.monsters) {
            this.scene.monsters.getChildren().forEach(m => {
                if (!m.active) return;
                const dist = Phaser.Math.Distance.Between(origin.x, origin.y, m.x, m.y);
                if (dist <= radius) {
                    this.towerSystem.applyTowerDamageLogic(tower, m);
                    RenderUtils.showHitEffect(this.scene, m.x, m.y, RenderUtils.getProjectileColor(tower));
                }
            });
        }
        
        this.postFire(tower, time);
    }
}
