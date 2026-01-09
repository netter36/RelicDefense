import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';
import Phaser from 'phaser';

export class NovaStrategy extends AttackStrategy {
    update(tower: Tower, time: number) {
        if (!this.canFire(tower, time)) return;
        
        const origin = this.towerSystem.getVisualCenter(tower);
        const radius = tower.range || 250;
        
        if (this.effectManager) {
            this.effectManager.drawNova(origin.x, origin.y, radius);
        }

        // Need to check if scene has monsters and if it's a Group or similar
        // TowerSystem has 'monsters' property in GameScene interface as Phaser.GameObjects.Group
        // But here we access via this.scene which is Phaser.Scene. We need to cast or rely on loose typing (any).
        // AttackStrategy defines scene as Phaser.Scene.
        // TowerSystem.ts defines GameScene.
        const scene = this.scene as any;

        if (scene.monsters) {
            scene.monsters.getChildren().forEach((m: Monster) => {
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
