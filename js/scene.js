import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_WIDTH, SLOT_SIZE, THEME } from './constants.js';
import { UIManager } from './systems/UIManager.js';
import { GridSystem } from './systems/GridSystem.js';
import { EnemySystem } from './systems/EnemySystem.js';
import { TowerSystem } from './systems/TowerSystem.js';
import { InputSystem } from './systems/InputSystem.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.selectedId = null; // Currently selected item ID from shop
    }

    create() {
        this.uiManager = new UIManager(this);

        // Initialize Systems
        this.gridSystem = new GridSystem(this, this.uiManager);
        this.enemySystem = new EnemySystem(this, null, this.uiManager); // Path init below
        this.towerSystem = new TowerSystem(this);
        this.inputSystem = new InputSystem(this, this.gridSystem);

        this.gridSystem.drawBackground();
        this.initPath(); // Helper to init path
        this.enemySystem.path = this.monsterPath;

        this.inputSystem.initInput();
        this.uiManager.initShop();

        // Spawn handled by EnemySystem
        // this.time.addEvent({ ... });

        // Build starting item
        this.time.delayedCall(100, () => {
            // no item
        });
    }

    initPath() {
        const side = 550;
        const minP = CANVAS_WIDTH / 2 - side / 2;
        const maxP = CANVAS_WIDTH / 2 + side / 2;
        this.monsterPath = new Phaser.Curves.Path(minP, minP);
        this.monsterPath.lineTo(maxP, minP).lineTo(maxP, maxP).lineTo(minP, maxP).lineTo(minP, minP);

        const g = this.add.graphics();
        g.lineStyle(24, THEME.pathTrack, 0.6);
        g.strokeRect(minP, minP, side, side);
        g.lineStyle(2, THEME.pathGlow, 0.3);
        g.strokeRect(minP, minP, side, side);
    }

    update(time, delta) {
        if (this.enemySystem) this.enemySystem.update(delta);
        if (this.towerSystem) this.towerSystem.update(time, this.gridSystem.placedItems);
    }

    // Expose for UIManager and Systems
    get monsters() { return this.enemySystem.monsters; }

    getDynamicDesc(item) {
        if (item.type === 'tablet') {
            const buffText = item.buff ? `🛡️ 인접 공격력 +${item.buff.val}%` : `[기초 시설]`;
            const color = item.buff ? '#4ade80' : '#94a3b8';
            return `<div style="font-size:0.95em; line-height:1.4;">
                <div style="color:${color}; font-weight:bold; margin-bottom:6px;">${buffText}</div>
                <div style="font-size:0.9em; color:#ccc; padding-top:4px; border-top:1px solid #ffffff20;">${item.baseDesc || item.desc || ""}</div>
            </div>`;
        }

        const stats = item.stats || {};
        let atk = item.currentAtk || stats.atk || 0;
        let range = item.range || stats.range || 250;
        let fr = item.currentFireRate || stats.fireRate || 1000;

        // DPS Calculation
        const dps = Math.round(atk * (1000 / (fr || 1000)));

        const synColors = {
            fire: '#ff5555',
            ice: '#33ddff',
            thunder: '#ffeb3b',
            leaf: '#4caf50',
            gem: '#e040fb'
        };

        let html = `<div style="font-size:0.95em; line-height:1.5;">`;
        html += `<div>⚡ 초당 공격력: <span style="color:#fbbf24; font-weight:bold;">${dps}</span></div>`;
        html += `<div>🎯 사거리: <span style="color:#38bdf8; font-weight:bold;">${range}</span></div>`;

        // Special Stats
        if (stats.attackType === 'rapid') {
            const reload = (stats.reloadTime || 0) / 1000;
            html += `<div>🔄 장전: <span style="color:#cbd5e1;">${reload.toFixed(1)}s</span> <span style="font-size:0.9em; color:#94a3b8;">(${stats.burstCount}연사)</span></div>`;
        }
        if (stats.attackType === 'chain') {
            html += `<div>🔗 연쇄: <span style="color:#a78bfa; font-weight:bold;">${stats.chainCount}명</span></div>`;
        }
        if (stats.attackType === 'multi') {
            html += `<div>✨ 동시: <span style="color:#f472b6; font-weight:bold;">${stats.projectileCount}발</span></div>`;
        }
        if (stats.aoeRadius) {
            html += `<div>💥 범위: <span style="color:#f87171; font-weight:bold;">${stats.aoeRadius}px</span></div>`;
        }

        // Active Synergy
        if (item.activeSynergy) {
            const sColor = synColors[item.element] || '#ffffff';
            html += `<div style="color:${sColor}; font-weight:bold; margin-top:4px;">✨ ${item.activeSynergy} 발동!</div>`;
        }

        // Description
        const desc = item.baseDesc || item.desc || "";
        if (desc) {
            html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #ffffff20; color:#ccc; font-size:0.9em;">${desc}</div>`;
        }

        // Flavor Text
        if (item.flavor) {
            html += `<div style="margin-top:4px; color:#94a3b8; font-size:0.8em; font-style:italic;">${item.flavor}</div>`;
        }

        html += `</div>`;
        return html;
    }

    // Helper for circular dependency in combat.js calling scene.updateMonsterCount
    updateMonsterCount() {
        if (this.enemySystem) this.enemySystem.updateMonsterCount();
    }

    updateHPBar(m) {
        // Delegated to enemy system via direct call or scene helper used by combat.js
        if (this.enemySystem) this.enemySystem.updateHPBar(m);
    }
}
