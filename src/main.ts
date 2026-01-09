import Phaser from 'phaser';
import MainScene from './scene';
import { CANVAS_WIDTH, CANVAS_HEIGHT, THEME } from './constants';

const config: Phaser.Types.Core.GameConfig = {
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
(window as any).phaserGame = game;

