import { AttackStrategy } from './AttackStrategy.js';
import { RenderUtils } from '../utils/RenderUtils.js';
import { COMBAT_CONFIG } from '../constants.js';

export class ChainStrategy extends AttackStrategy {
    fire(tower, target, origin, time) {
        const chainCount = tower.stats.chainCount || 3;
        this.fireChain(tower, target, chainCount, [], origin);
    }

    fireChain(tower, target, jumpsRemaining, hitList, origin) {
        if (!target || !target.active || jumpsRemaining <= 0) return;
        hitList.push(target);

        const startX = origin ? origin.x : tower.x;
        const startY = origin ? origin.y : tower.y;

        this._processChainLink(startX, startY, target, jumpsRemaining, hitList, tower);
    }

    _processChainLink(startX, startY, target, jumps, hitList, tower) {
        if (!target || !target.active) return;

        // Visual: Lightning
        if (this.effectManager) {
            this.effectManager.drawLightning(startX, startY, target.x, target.y, RenderUtils.getProjectileColor(tower));
        }

        this.towerSystem.applyTowerDamageLogic(tower, target);
        RenderUtils.showHitEffect(this.scene, target.x, target.y, RenderUtils.getProjectileColor(tower));

        if (jumps > 1) {
            const range = COMBAT_CONFIG.CHAIN_JUMP_RANGE;
            const next = this.towerSystem.getNearestMonster(target.x, target.y, range, hitList);
            if (next) {
                this.scene.time.delayedCall(100, () => {
                    this._processChainLink(target.x, target.y, next, jumps - 1, hitList.concat([next]), tower);
                });
            }
        }
    }
}
