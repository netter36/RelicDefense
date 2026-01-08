import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class ProjectileStrategy extends AttackStrategy {
    fire(tower, target, origin, time) {
        const proj = RenderUtils.createProjectile(this.scene, origin.x, origin.y, target, tower);
        const spread = 20;
        const tx = target.x + (Math.random() * spread - spread / 2);
        const ty = target.y + (Math.random() * spread - spread / 2);

        this.scene.tweens.add({
            targets: proj,
            x: tx,
            y: ty,
            duration: 200,
            onComplete: () => {
                RenderUtils.destroyProjectile(proj);
                if (target.active) {
                    this.onHit(tower, target);
                }
            }
        });
    }

    onHit(tower, target) {
        if (tower.id === 'thunder_heavy' || tower.id === 'judgement_prism' || tower.activeSynergy === '전격의 시너지') {
            RenderUtils.createSpearStrike(this.scene, target.x, target.y, 0xffff00);
            this.towerSystem.applyTowerDamageLogic(tower, target);
        } else if (tower.element === 'leaf' || tower.activeSynergy === '대지의 시너지') {
            RenderUtils.createArrowRain(this.scene, target.x, target.y, 0x4ade80, () => {
                if (target.active) {
                    this.towerSystem.applyTowerDamageLogic(tower, target);
                }
            });
        } else {
            RenderUtils.showHitEffect(this.scene, target.x, target.y, RenderUtils.getProjectileColor(tower));
            this.towerSystem.applyTowerDamageLogic(tower, target);
        }
    }
}
