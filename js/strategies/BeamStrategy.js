import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class BeamStrategy extends AttackStrategy {
    fire(tower, target, origin, time) {
        const angle = Phaser.Math.Angle.Between(origin.x, origin.y, target.x, target.y);
        const coneAngle = tower.stats.coneAngle || 0.5;
        
        if (this.effectManager) {
            this.effectManager.drawBeam(origin.x, origin.y, tower.range, angle, coneAngle, RenderUtils.getProjectileColor(tower));
        }
        
        if (this.scene.monsters) {
            this.scene.monsters.getChildren().forEach(m => {
                if (!m.active) return;
                const d = Phaser.Math.Distance.Between(origin.x, origin.y, m.x, m.y);
                if (d <= tower.range) {
                    const angleToM = Phaser.Math.Angle.Between(origin.x, origin.y, m.x, m.y);
                    let diff = Phaser.Math.Angle.Wrap(angle - angleToM);
                    if (Math.abs(diff) <= coneAngle / 2) {
                         this.towerSystem.applyTowerDamageLogic(tower, m);
                         if (Math.random() < 0.3) {
                            RenderUtils.showHitEffect(this.scene, m.x, m.y, RenderUtils.getProjectileColor(tower));
                        }
                    }
                }
            });
        }
    }
}
