import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { Tower, Monster } from '../types';

export class ProjectileStrategy extends AttackStrategy {
    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
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

    onHit(tower: Tower, target: Monster) {
        // [Fix] Property 'id' does not exist on type 'Tower'. Tower interface uses 'id' inside?
        // Let's check Tower interface. It has [key: string]: any, so it should be fine.
        if (tower.id === 'thunder_heavy' || tower.id === 'judgement_prism' || tower.activeSynergy === '전격의 시너지') {
            RenderUtils.createSpearStrike(this.scene, target.x, target.y, 0xffff00);
            this.towerSystem.applyTowerDamageLogic(tower, target);
        } else if (tower.element === 'leaf' || tower.activeSynergy === '생명의 시너지') {
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
