import MainScene from './scene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, THEME } from './constants.js';

const config = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    parent: 'phaser-game-container',
    backgroundColor: '#' + THEME.bg.toString(16),
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);

// Globally available for external access if needed
window.phaserGame = game;
