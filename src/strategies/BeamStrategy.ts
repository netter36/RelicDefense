import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class BeamStrategy extends AttackStrategy {
    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
        const angle = Phaser.Math.Angle.Between(origin.x, origin.y, target.x, target.y);
        const coneAngle = tower.stats.coneAngle || 0.5;
        const range = tower.range || 250;
        
        if (this.effectManager) {
            this.effectManager.drawBeam(origin.x, origin.y, range, angle, coneAngle, RenderUtils.getProjectileColor(tower));
        }
        
        const scene = this.scene as any;
        if (scene.monsters) {
            scene.monsters.getChildren().forEach((m: Monster) => {
                if (!m.active) return;
                const d = Phaser.Math.Distance.Between(origin.x, origin.y, m.x, m.y);
                if (d <= range) {
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
