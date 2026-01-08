import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_WIDTH, SLOT_SIZE, THEME, GAME_CONFIG } from './constants.js';
import { UIManager } from './systems/UIManager.js';
import { EffectManager } from './managers/EffectManager.js';
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
        this.gold = GAME_CONFIG.INITIAL_GOLD;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.gameTimer = 0;
        this.uiManager = new UIManager(this);
        this.uiManager.updateGold(this.gold);
        // this.uiManager.updateLives(this.lives); // Removed: Game Over based on monster count now

        this.effectManager = new EffectManager(this);

        // Initialize Systems
        this.gridSystem = new GridSystem(this, this.uiManager);
        this.enemySystem = new EnemySystem(this, null, this.uiManager, this.effectManager); // Path init below
        this.towerSystem = new TowerSystem(this, this.effectManager);
        this.inputSystem = new InputSystem(this, this.gridSystem);

        this.gridSystem.drawBackground();
        this.initPath(); // Helper to init path
        this.enemySystem.path = this.monsterPath;

        this.inputSystem.initInput();
        this.uiManager.initShop();

        // Spawn handled by EnemySystem
        // this.time.addEvent({ ... });

        // Build starting item
        // FPS Counter
        this.fpsElem = document.getElementById('fps-counter');
        this.fpsUpdateTimer = 0;
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
        if (this.isGameOver) return;

        // Apply timeScale manually because Phaser's delta is unscaled
        const scaledDelta = delta * this.time.timeScale;

        this.gameTimer += scaledDelta;
        
        // FPS Update (every 200ms) - Use unscaled delta for UI
        this.fpsUpdateTimer += delta;
        if (this.fpsUpdateTimer > 200 && this.fpsElem) {
            this.fpsElem.innerText = `FPS: ${Math.round(this.game.loop.actualFps)}`;
            this.fpsUpdateTimer = 0;
        }

        if (this.enemySystem) this.enemySystem.update(scaledDelta);
        if (this.towerSystem) this.towerSystem.update(this.gameTimer, this.gridSystem.placedItems);
    }

    addGold(amount) {
        this.gold += amount;
        this.uiManager.updateGold(this.gold);
        // this.uiManager.renderItems(); // Removed: Prevent shop flickering
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.uiManager.updateGold(this.gold);
            // this.uiManager.renderItems(); // Removed: Prevent shop flickering
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.lives -= amount;
        if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver();
        }
        this.uiManager.updateLives(this.lives);
    }

    gameOver() {
        this.isGameOver = true;
        this.add.rectangle(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7).setDepth(1000);
        this.add.text(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);
        this.scene.pause();
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
