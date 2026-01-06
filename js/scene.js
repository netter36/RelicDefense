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
        this.gameTimer = 0;
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

    setSpeed(factor) {
        this.time.timeScale = factor;
        this.tweens.timeScale = factor;
    }

    update(time, delta) {
        this.gameTimer += delta;
        if (this.enemySystem) this.enemySystem.update(delta);
        if (this.towerSystem) this.towerSystem.update(this.gameTimer, this.gridSystem.placedItems);
    }

    // Expose for UIManager and Systems
    get monsters() { return this.enemySystem.monsters; }



    // Helper for circular dependency in combat.js calling scene.updateMonsterCount
    updateMonsterCount() {
        if (this.enemySystem) this.enemySystem.updateMonsterCount();
    }

    updateHPBar(m) {
        // Delegated to enemy system via direct call or scene helper used by combat.js
        if (this.enemySystem) this.enemySystem.updateHPBar(m);
    }
}
