import { ITEMS } from '../items.js';
import { SLOT_SIZE } from '../constants.js';

export class InputSystem {
    constructor(scene, gridSystem) {
        this.scene = scene;
        this.gridSystem = gridSystem;
    }

    initInput() {
        this.scene.input.mouse.disableContextMenu();

        // Handle placement from shop
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.scene.selectedId) {
                const gx = Math.floor((pointer.x - this.gridSystem.gridStartPos.x) / SLOT_SIZE);
                const gy = Math.floor((pointer.y - this.gridSystem.gridStartPos.y) / SLOT_SIZE);
                const item = ITEMS.find(i => i.id === this.scene.selectedId);

                if (item && this.gridSystem.canPlace(item, gx, gy)) {
                    this.gridSystem.createItem(this.scene.selectedId, gx, gy);
                    this.scene.selectedId = null;
                    this.scene.input.setDefaultCursor('default');
                } else if (!this.scene.input.hitTestPointer(pointer).length) {
                    // Cancel selection if clicked elsewhere on background
                    this.scene.selectedId = null;
                    this.scene.input.setDefaultCursor('default');
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
