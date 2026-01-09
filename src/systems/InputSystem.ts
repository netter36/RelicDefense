import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { SLOT_SIZE } from '../constants';
import { GridSystem } from './GridSystem';

interface GameScene extends Phaser.Scene {
    selectedId: string | null;
}

export class InputSystem {
    scene: GameScene;
    gridSystem: GridSystem;

    constructor(scene: Phaser.Scene, gridSystem: GridSystem) {
        this.scene = scene as GameScene;
        this.gridSystem = gridSystem;
    }

    initInput() {
        if (this.scene.input.mouse) this.scene.input.mouse.disableContextMenu();

        // Handle placement from shop
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown() && this.scene.selectedId) {
                const gx = Math.floor((pointer.x - this.gridSystem.gridStartPos.x) / SLOT_SIZE);
                const gy = Math.floor((pointer.y - this.gridSystem.gridStartPos.y) / SLOT_SIZE);
                const item = ITEMS.find(i => i.id === this.scene.selectedId);

                // Create a dummy item for checking placement compatibility if needed, 
                // but createItem checks internally too. However canPlace needs an object with width/height/shape.
                // We'll trust createItem to handle it or create a dummy.
                // GridSystem.canPlace expects an item object.
                if (item) {
                     // We need to construct a temporary object to check placement, or just let createItem fail?
                     // But createItem returns the item or null.
                     // The logic here checks canPlace BEFORE createItem.
                     // We need width/height/shape from item.
                     const w = item.width || (item.shape ? item.shape[0].length : 1);
                     const h = item.height || (item.shape ? item.shape.length : 1);
                     const dummy: any = { ...item, width: w, height: h };
                     
                     if (this.gridSystem.canPlace(dummy, gx, gy)) {
                        this.gridSystem.createItem(this.scene.selectedId!, gx, gy);
                        this.scene.selectedId = null;
                        this.scene.input.setDefaultCursor('default');
                     } else if (this.scene.input.hitTestPointer(pointer).length === 0) {
                        // Cancel selection if clicked elsewhere on background
                        this.scene.selectedId = null;
                        this.scene.input.setDefaultCursor('default');
                    }
                }
            } else if (pointer.rightButtonDown()) {
                // Right click cancels selection
                if (this.scene.selectedId) {
                    this.scene.selectedId = null;
                    this.scene.input.setDefaultCursor('default');
                }
            }
        });

        // Global key events
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'r' && this.gridSystem.hoveredItem) {
                this.gridSystem.rotateItem(this.gridSystem.hoveredItem);
            }
            if (e.key === 'Escape') {
                this.scene.selectedId = null;
                this.scene.input.setDefaultCursor('default');
            }
        });
    }
}
