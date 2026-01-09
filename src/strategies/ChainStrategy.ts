import { AttackStrategy } from './AttackStrategy';
import { RenderUtils } from '../utils/RenderUtils';
import { COMBAT_CONFIG } from '../constants';
import { Tower, Monster } from '../types';

export class ChainStrategy extends AttackStrategy {
    fire(tower: Tower, target: Monster, origin: {x: number, y: number}, time: number) {
        const chainCount = tower.stats.chainCount || 3;
        this.fireChain(tower, target, chainCount, [], origin);
    }

    fireChain(tower: Tower, target: Monster, jumpsRemaining: number, hitList: Monster[], origin: {x: number, y: number} | null) {
        if (!target || !target.active || jumpsRemaining <= 0) return;
        hitList.push(target);

        const startX = origin ? origin.x : tower.x;
        const startY = origin ? origin.y : tower.y;

        this._processChainLink(startX, startY, target, jumpsRemaining, hitList, tower);
    }

    _processChainLink(startX: number, startY: number, target: Monster, jumps: number, hitList: Monster[], tower: Tower) {
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
