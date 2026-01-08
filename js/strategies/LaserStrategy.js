import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';
import { COMBAT_CONFIG } from '../constants.js';

export class LaserStrategy extends AttackStrategy {
    fire(tower, target, origin, time) {
        const colors = { fire: 0xff5555, ice: 0x33ddff, thunder: 0xffeb3b, leaf: 0x4caf50, gem: 0xe040fb };
        const color = colors[tower.element] || 0xef4444;

        if (this.effectManager) {
            this.effectManager.drawLaser(origin.x, origin.y, target.x, target.y, color, tower.element === 'gem' ? 6 : 4, tower.element === 'gem' ? 0.6 : 1);
        }

        this.towerSystem.applyTowerDamageLogic(tower, target, COMBAT_CONFIG.LASER_DAMAGE_MULT);
        RenderUtils.showHitEffect(this.scene, target.x, target.y, RenderUtils.getProjectileColor(tower));
    }
}
