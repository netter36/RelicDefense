import { ITEMS } from '../data/items.js';
import { GRID_WIDTH, GRID_HEIGHT, SLOT_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, THEME, SYNERGIES, GAME_CONFIG } from '../constants.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class GridSystem {
    constructor(scene, uiManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
        this.placedItems = [];
        this.gridStartPos = {
            x: (CANVAS_WIDTH - (GRID_WIDTH * SLOT_SIZE)) / 2,
            y: (CANVAS_HEIGHT - (GRID_HEIGHT * SLOT_SIZE)) / 2
        };
    }

    drawBackground() {
        const g = this.scene.add.graphics();
        
        // 1. Panel Background (Dark Sci-Fi Slate)
        const padding = 8;
        const totalW = GRID_WIDTH * SLOT_SIZE;
        const totalH = GRID_HEIGHT * SLOT_SIZE;
        
        g.fillStyle(0x0f172a, 0.9);
        g.lineStyle(2, 0x334155, 1);
        g.fillRoundedRect(this.gridStartPos.x - padding, this.gridStartPos.y - padding, totalW + padding*2, totalH + padding*2, 4);
        g.strokeRoundedRect(this.gridStartPos.x - padding, this.gridStartPos.y - padding, totalW + padding*2, totalH + padding*2, 4);

        // 2. Grid Slots
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const rx = this.gridStartPos.x + x * SLOT_SIZE;
                const ry = this.gridStartPos.y + y * SLOT_SIZE;
                
                // Inner Slot Background
                g.fillStyle(0x1e293b, 0.5);
                g.fillRect(rx + 1, ry + 1, SLOT_SIZE - 2, SLOT_SIZE - 2);

                // Tech Corners
                g.lineStyle(1, 0x475569, 0.4);
                const c = 4; // Corner length
                const m = 2; // Margin from edge
                
                g.beginPath();
                // TL
                g.moveTo(rx + m, ry + m + c); g.lineTo(rx + m, ry + m); g.lineTo(rx + m + c, ry + m);
                // TR
                g.moveTo(rx + SLOT_SIZE - m - c, ry + m); g.lineTo(rx + SLOT_SIZE - m, ry + m); g.lineTo(rx + SLOT_SIZE - m, ry + m + c);
                // BR
                g.moveTo(rx + SLOT_SIZE - m, ry + SLOT_SIZE - m - c); g.lineTo(rx + SLOT_SIZE - m, ry + SLOT_SIZE - m); g.lineTo(rx + SLOT_SIZE - m - c, ry + SLOT_SIZE - m);
                // BL
                g.moveTo(rx + m + c, ry + SLOT_SIZE - m); g.lineTo(rx + m, ry + SLOT_SIZE - m); g.lineTo(rx + m, ry + SLOT_SIZE - m - c);
                g.strokePath();

                // Center Dot
                g.fillStyle(0x334155, 0.5);
                g.fillPoint(rx + SLOT_SIZE/2, ry + SLOT_SIZE/2, 1);
            }
        }
    }

    createItem(id, gx, gy) {
        const template = ITEMS.find(i => i.id === id);
        if (!template) return null;

        const item = JSON.parse(JSON.stringify(template));
        item.gridPos = { x: gx, y: gy };
        item.lastFire = 0;
        item.currentAtk = item.stats?.atk || 0;
        item.currentFireRate = item.stats?.fireRate || 1000;
        item.range = item.stats?.range || 250;
        item.isSynergetic = false;

        if (item.width === undefined) item.width = item.shape[0].length;
        if (item.height === undefined) item.height = item.shape.length;

        const container = this.scene.add.container(0, 0);
        container.setSize(item.width * SLOT_SIZE, item.height * SLOT_SIZE);

        // Precise Hit Testing (Ignore empty space in L-shapes)
        container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, container.width, container.height),
            hitAreaCallback: (hitArea, x, y, gameObject) => {
                const col = Math.floor(x / SLOT_SIZE);
                const row = Math.floor(y / SLOT_SIZE);
                return item.shape[row] && item.shape[row][col];
            }
        });

        this.scene.input.setDraggable(container);
        container.setDepth(5); // 블럭 기본 깊이를 10 -> 5로 낮춤 (투사체 100)
        item.el = container;
        this.placedItems.push(item);

        // Interaction Logic
        container.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.removeItem(item);
            }
        });

        container.on('pointerover', (pointer) => {
            this.hoveredItem = item; // Track hovered item for rotation
            this.uiManager.showTooltip(pointer, item, true);
            // Show Range on Hover
            if (item.type !== 'tablet') {
                if (!this.hoverRange) {
                    this.hoverRange = this.scene.add.graphics();
                    this.hoverRange.setDepth(95); // Below dragged item(100) but above placed items(10)
                }
                this.hoverRange.clear();
                this.hoverRange.lineStyle(2, 0xffffff, 0.4); // Subtle white ring for hover
                this.hoverRange.fillStyle(0xffffff, 0.05);
                this.hoverRange.strokeCircle(container.x, container.y, item.range || 250);
                this.hoverRange.fillCircle(container.x, container.y, item.range || 250);
            }
        });

        container.on('pointerout', () => {
            this.hoveredItem = null;
            this.uiManager.hideTooltip();
            if (this.hoverRange) {
                this.hoverRange.clear();
            }
        });

        container.on('drag', (pointer, dragX, dragY) => {
            container.x = dragX;
            container.y = dragY;
            item.x = dragX;
            item.y = dragY;
            container.setDepth(100); // Bring to front while dragging
        });

        container.on('dragend', () => {
            container.setDepth(5); // 드래그 종료 후 깊이 복구 (기존 10 -> 5)
            const gx = Math.floor((container.x - this.gridStartPos.x) / SLOT_SIZE);
            const gy = Math.floor((container.y - this.gridStartPos.y) / SLOT_SIZE);

            // Temporarily remove from grid to check new position
            this.setGrid(item, null);

            // Adjust gridPos for the new top-left based on center position
            // But wait, snap() uses gridPos to set center. 
            // Drag uses center. 
            // We need to calculate top-left grid coordinates from center.
            // item.width/height are in slots.
            // Center is at: start + gridPos*SIZE + size/2
            // So: gridPos = (Center - start - size/2) / SIZE
            const newGx = Math.round((container.x - this.gridStartPos.x - (item.width * SLOT_SIZE) / 2) / SLOT_SIZE);
            const newGy = Math.round((container.y - this.gridStartPos.y - (item.height * SLOT_SIZE) / 2) / SLOT_SIZE);

            item.gridPos = { x: newGx, y: newGy };

            if (this.canPlace(item, newGx, newGy)) {
                this.snap(item);
                this.setGrid(item, item);
                this.calculateSynergies();
            } else {
                // Revert to old valid position if invalid (this simplistic logic relies on item.gridPos being updated only on success, 
                // but we updated it above. We need to store old pos.)
                // Actually easier: just try to place. If fail, we need to know where it WAS.
                // The item object still has old gridPos if we didn't update it yet? 
                // No, we updated it. Let's fix this logic.
            }
        });

        // Better Drag End Logic
        container.off('dragend'); // remove any previous
        container.on('dragend', (pointer) => {
            container.setDepth(5); // [Fix] 드래그 종료 시 기본 깊이 5로 통일
            // Calculate proposed grid coordinates
            const newGx = Math.round((container.x - this.gridStartPos.x - (item.width * SLOT_SIZE) / 2) / SLOT_SIZE);
            const newGy = Math.round((container.y - this.gridStartPos.y - (item.height * SLOT_SIZE) / 2) / SLOT_SIZE);

            // Check if valid (excluding itself, so we remove first)
            this.setGrid(item, null);

            const oldGx = item.gridPos.x;
            const oldGy = item.gridPos.y;

            item.gridPos = { x: newGx, y: newGy }; // Try new

            if (this.canPlace(item, newGx, newGy)) {
                this.snap(item);
                this.setGrid(item, item);
                this.calculateSynergies();

                // Refresh UI (Tooltip & Range) immediately after placement
                this.uiManager.showTooltip(pointer, item, true);
                if (item.type !== 'tablet') {
                    if (!this.hoverRange) {
                        this.hoverRange = this.scene.add.graphics();
                        this.hoverRange.setDepth(95);
                    }
                    this.hoverRange.clear();
                    this.hoverRange.lineStyle(2, 0xffffff, 0.4);
                    this.hoverRange.fillStyle(0xffffff, 0.05);
                    this.hoverRange.strokeCircle(container.x, container.y, item.range || 250);
                    this.hoverRange.fillCircle(container.x, container.y, item.range || 250);
                }

            } else {
                // Revert
                item.gridPos = { x: oldGx, y: oldGy };
                this.snap(item);
                this.setGrid(item, item);
                this.calculateSynergies(); // Re-calc in case we broke something briefly? Safest.
            }
        });

        RenderUtils.renderProceduralShape(this.scene, container, item);
        this.snap(item);
        this.setGrid(item, item);
        this.calculateSynergies();

        return item;
    }

    autoPlaceItem(id) {
        const template = ITEMS.find(i => i.id === id);
        if (!template) return false;

        const w = template.width || template.shape[0].length;
        const h = template.height || template.shape.length;
        const dummy = { shape: template.shape, width: w, height: h };

        for (let y = 0; y <= GRID_HEIGHT - h; y++) {
            for (let x = 0; x <= GRID_WIDTH - w; x++) {
                if (this.canPlace(dummy, x, y)) {
                    this.createItem(id, x, y);
                    return true;
                }
            }
        }
        return false;
    }

    removeItem(item) {
        // [추가] 삭제 전 호버 상태 정리 (툴팁 및 사거리 표시 제거)
        if (this.hoveredItem === item) {
            this.hoveredItem = null;
            this.uiManager.hideTooltip();
            if (this.hoverRange) {
                this.hoverRange.clear();
            }
        }

        this.setGrid(item, null);
        this.placedItems = this.placedItems.filter(i => i !== item);
        if (item.el) item.el.destroy();
        
        // Sell logic (refund 50%)
        const cost = item.type === 'tablet' ? GAME_CONFIG.COSTS.TABLET : GAME_CONFIG.COSTS.ARTIFACT;
        if (this.scene.addGold) this.scene.addGold(Math.floor(cost * 0.5));
        
        this.calculateSynergies();
    }





    snap(item) {
        item.el.x = this.gridStartPos.x + item.gridPos.x * SLOT_SIZE + (item.width * SLOT_SIZE) / 2;
        item.el.y = this.gridStartPos.y + item.gridPos.y * SLOT_SIZE + (item.height * SLOT_SIZE) / 2;
        item.x = item.el.x;
        item.y = item.el.y;
    }

    setGrid(item, val) {
        if (!item.gridPos) return;
        item.shape.forEach((row, dy) => row.forEach((v, dx) => {
            if (v && this.grid[item.gridPos.y + dy] && this.grid[item.gridPos.y + dy][item.gridPos.x + dx] !== undefined) {
                this.grid[item.gridPos.y + dy][item.gridPos.x + dx] = val;
            }
        }));
    }

    canPlace(item, x, y) {
        if (x < 0 || y < 0 || x + item.width > GRID_WIDTH || y + item.height > GRID_HEIGHT) return false;
        return item.shape.every((row, dy) => row.every((v, dx) => !v || !this.grid[y + dy][x + dx]));
    }

    rotateItem(item) {
        if (!item) return;

        // 1. Remove from grid temporarily
        this.setGrid(item, null);

        // 2. Rotate Shape Matrix (Clockwise)
        const oldShape = item.shape;
        const rows = oldShape.length;
        const cols = oldShape[0].length;

        const newShape = Array.from({ length: cols }, () => Array(rows).fill(0));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                newShape[c][rows - 1 - r] = oldShape[r][c];
            }
        }

        // 3. Update dimensions
        const oldW = item.width;
        const oldH = item.height;
        item.shape = newShape;
        item.width = rows;  // Correctly swap width/height logic
        item.height = cols;

        // 4. Try place
        // 경계 검사를 수행하고, 경계를 벗어나면 안쪽으로 밀어넣기 시도
        let placeX = item.gridPos.x;
        let placeY = item.gridPos.y;

        if (placeX + item.width > GRID_WIDTH) {
            placeX = GRID_WIDTH - item.width;
        }
        if (placeY + item.height > GRID_HEIGHT) {
            placeY = GRID_HEIGHT - item.height;
        }

        // 배치 가능 여부 확인
        if (this.canPlace(item, placeX, placeY)) {
            // Success
            item.gridPos.x = placeX;
            item.gridPos.y = placeY;
            
            this.snap(item);
            this.setGrid(item, item);
            RenderUtils.renderProceduralShape(this.scene, item.el, item);

            // [Fix] 회전 후 Hit Area(드래그 영역) 업데이트
            const w = item.width * SLOT_SIZE;
            const h = item.height * SLOT_SIZE;
            item.el.setSize(w, h);
            // 컨테이너 중심 기준 Hit Area 재설정
            item.el.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-w/2, -h/2, w, h),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                draggable: true
            });
            this.scene.input.setDraggable(item.el); // 드래그 가능 상태 재확인

            this.calculateSynergies();

            // Re-show range if hovering
            if (this.hoverRange) {
                this.hoverRange.clear();
                this.hoverRange.lineStyle(2, 0xffffff, 0.4);
                this.hoverRange.fillStyle(0xffffff, 0.05);
                this.hoverRange.strokeCircle(item.el.x, item.el.y, item.range || 250);
                this.hoverRange.fillCircle(item.el.x, item.el.y, item.range || 250);
            }

        } else {
            // Revert
            item.shape = oldShape;
            item.width = oldW;
            item.height = oldH;
            this.setGrid(item, item);
            // Shake effect for feedback?
            this.scene.tweens.add({
                targets: item.el,
                x: item.el.x + 5,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }
    }

    calculateSynergies() {
        const { activeCombos } = this._calculateSynergiesLogic(this.placedItems, SLOT_SIZE);
        this.placedItems.forEach(item => { if (item.el) RenderUtils.renderProceduralShape(this.scene, item.el, item); });
        const totalAtk = this.placedItems.reduce((acc, i) => acc + (i.currentAtk || 0), 0);
        this.uiManager.updateHUD({ atk: Math.round(totalAtk), fireBonus: 0, artifacts: 0, combos: activeCombos });
        this.uiManager.renderItems();
    }

    // Merged logic from synergy.js
    _calculateSynergiesLogic(placedItems, slotSize) {
        const activeCombos = [];
        const visited = new Set();

        placedItems.forEach(i => {
            i.isSynergetic = false;
            i.activeSynergy = null;
            i.currentAtk = i.stats?.atk || 0;
            i.currentFireRate = i.stats?.fireRate || 1000;
            i.range = i.stats?.range || 250;
            i.critChance = 0;
            i.debuffEfficiency = 1;
        });

        // Apply Tablet Buffs
        placedItems.forEach(tablet => {
            if (tablet.type === 'tablet' && tablet.buff) {
                placedItems.forEach(target => {
                    if (target !== tablet && target.type === 'artifact' && this._areAdjacent(tablet, target, slotSize)) {
                        if (tablet.buff.type === 'atk') {
                            target.currentAtk *= (1 + tablet.buff.val / 100);
                        } else if (tablet.buff.type === 'range') {
                            target.range *= (1 + tablet.buff.val / 100);
                        } else if (tablet.buff.type === 'focus') {
                            target.currentAtk *= (1 + tablet.buff.val / 100);
                            target.range *= (1 - tablet.buff.penalty / 100);
                        }
                    }
                });
            }
        });


        placedItems.forEach(startItem => {
            if (visited.has(startItem) || !startItem.element) return;

            const group = [];
            const queue = [startItem];
            visited.add(startItem);

            while (queue.length > 0) {
                const current = queue.shift();
                group.push(current);

                placedItems.forEach(neighbor => {
                    if (!visited.has(neighbor) && neighbor.element === startItem.element && this._areAdjacent(current, neighbor, slotSize)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }

            const syn = SYNERGIES.find(s => s.element === startItem.element);
            if (syn && group.length >= syn.req) {
                if (!activeCombos.includes(syn.name)) activeCombos.push(syn.name);
                group.forEach(i => {
                    i.isSynergetic = true;
                    i.activeSynergy = syn.name;
                    if (syn.id === 'fire_power') i.currentAtk *= 1.2;
                    if (syn.id === 'thunder_rapid') i.currentFireRate *= 0.7;
                    if (syn.id === 'leaf_regen') i.range *= 1.15;
                    if (syn.id === 'ice_freeze') i.debuffEfficiency = 1.25;
                    if (syn.id === 'gem_legend') i.critChance = 0.1;
                    if (syn.id === 'shadow_curse') i.executeThreshold = 0.3;
                    if (syn.id === 'plasma_boom') i.aoeMult = 1.5;
                    if (syn.id === 'mystic_pierce') i.pierceCount = (i.pierceCount || 0) + 1;
                });
            }
        });

        return { activeCombos };
    }

    _areAdjacent(itemA, itemB, slotSize) {
        if (!itemA || !itemB) return false;
        const a = itemA.gridPos || { x: Math.floor(itemA.x / slotSize), y: Math.floor(itemA.y / slotSize) };
        const b = itemB.gridPos || { x: Math.floor(itemB.x / slotSize), y: Math.floor(itemB.y / slotSize) };

        const cellsA = [];
        itemA.shape.forEach((row, dy) => {
            row.forEach((v, dx) => { if (v) cellsA.push({ x: a.x + dx, y: a.y + dy }); });
        });

        const cellsB = [];
        itemB.shape.forEach((row, dy) => {
            row.forEach((v, dx) => { if (v) cellsB.push({ x: b.x + dx, y: b.y + dy }); });
        });

        for (let cA of cellsA) {
            for (let cB of cellsB) {
                const dist = Math.abs(cA.x - cB.x) + Math.abs(cA.y - cB.y);
                if (dist === 1) return true;
            }
        }
        return false;
    }
}
