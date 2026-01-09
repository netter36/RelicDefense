import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, THEME, GAME_CONFIG, PATH_CONFIG, GAME_OVER_CONFIG } from './constants';
import { UIManager } from './managers/UIManager';
import { EffectManager } from './managers/EffectManager';
import { GridSystem } from './systems/GridSystem';
import { EnemySystem } from './systems/EnemySystem';
import { TowerSystem } from './systems/TowerSystem';
import { InputSystem } from './systems/InputSystem';

export default class MainScene extends Phaser.Scene {
    selectedId: string | null = null;
    gold: number = 0;
    lives: number = 0;
    gameTimer: number = 0;
    
    uiManager!: UIManager;
    effectManager!: EffectManager;
    gridSystem!: GridSystem;
    enemySystem!: EnemySystem;
    towerSystem!: TowerSystem;
    inputSystem!: InputSystem;
    
    monsterPath!: Phaser.Curves.Path;
    fpsElem: HTMLElement | null = null;
    fpsUpdateTimer: number = 0;
    isGameOver: boolean = false;
    
    // Public group for projectiles (used by RenderUtils)
    projectileGroup!: Phaser.GameObjects.Group;

    constructor() {
        super('MainScene');
    }

    create() {
        this.gold = GAME_CONFIG.INITIAL_GOLD;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.gameTimer = 0;
        this.uiManager = new UIManager(this);
        this.events.emit('gold-change', this.gold);

        this.effectManager = new EffectManager(this);

        // Initialize Systems
        this.gridSystem = new GridSystem(this, this.uiManager);
        this.enemySystem = new EnemySystem(this, null as any, this.uiManager, this.effectManager); // Path init below
        this.towerSystem = new TowerSystem(this, this.effectManager);
        this.inputSystem = new InputSystem(this, this.gridSystem);

        this.gridSystem.drawBackground();
        this.initPath(); // Helper to init path
        this.enemySystem.path = this.monsterPath;

        this.inputSystem.initInput();
        this.uiManager.initShop();

        // FPS Counter
        this.fpsElem = document.getElementById('fps-counter');
        this.fpsUpdateTimer = 0;
    }

    initPath() {
        const side = PATH_CONFIG.SIDE_LENGTH;
        const minP = CANVAS_WIDTH / 2 - side / 2;
        const maxP = CANVAS_WIDTH / 2 + side / 2;
        this.monsterPath = new Phaser.Curves.Path(minP, minP);
        this.monsterPath.lineTo(maxP, minP).lineTo(maxP, maxP).lineTo(minP, maxP).lineTo(minP, minP);

        const g = this.add.graphics();
        g.lineStyle(PATH_CONFIG.THICKNESS, THEME.pathTrack, PATH_CONFIG.OPACITY);
        g.strokeRect(minP, minP, side, side);
        g.lineStyle(PATH_CONFIG.GLOW_THICKNESS, THEME.pathGlow, PATH_CONFIG.GLOW_OPACITY);
        g.strokeRect(minP, minP, side, side);
    }

    setSpeed(factor: number) {
        this.time.timeScale = factor;
        this.tweens.timeScale = factor;
    }

    update(time: number, delta: number) {
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

    addGold(amount: number) {
        this.gold += amount;
        this.events.emit('gold-change', this.gold);
    }

    spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.events.emit('gold-change', this.gold);
            return true;
        }
        return false;
    }

    takeDamage(amount: number) {
        this.lives -= amount;
        if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver();
        }
        this.events.emit('lives-change', this.lives);
    }

    gameOver() {
        this.isGameOver = true;
        this.add.rectangle(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7).setDepth(1000);
        this.add.text(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 'GAME OVER', {
            fontSize: GAME_OVER_CONFIG.TEXT_SIZE,
            color: GAME_OVER_CONFIG.TEXT_COLOR,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);
        
        this.add.text(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60, 'Click to Restart', {
            fontSize: GAME_OVER_CONFIG.SUBTEXT_SIZE,
            color: GAME_OVER_CONFIG.SUBTEXT_COLOR
        }).setOrigin(0.5).setDepth(1001);

        this.input.once('pointerdown', () => {
            this.isGameOver = false;
            this.scene.restart();
        });

        this.physics.pause();
    }

    // Expose for UIManager and Systems
    get monsters() { return this.enemySystem.monsters; }

    // Helper for circular dependency in combat.js calling scene.updateMonsterCount
    updateMonsterCount() {
        if (this.enemySystem) this.enemySystem.updateMonsterCount();
    }

    updateHPBar(m: any) {
        // Delegated to enemy system via direct call or scene helper used by combat.js
        if (this.enemySystem) this.enemySystem.updateHPBar(m);
    }
}
