import { ITEMS } from '../items.js';
import { GRID_WIDTH, GRID_HEIGHT, SLOT_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, THEME, ELEMENT_COLORS, SYNERGIES } from '../constants.js';

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
        g.lineStyle(1, 0xffffff, 0.05);
        g.fillStyle(0x1a1a1e, 0.6);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const rx = this.gridStartPos.x + x * SLOT_SIZE;
                const ry = this.gridStartPos.y + y * SLOT_SIZE;
                g.fillRect(rx, ry, SLOT_SIZE, SLOT_SIZE);
                g.strokeRect(rx, ry, SLOT_SIZE, SLOT_SIZE);
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
        container.setDepth(10);
        item.el = container;
        this.placedItems.push(item);

        // Interaction Logic
        container.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.removeItem(item);
            }
        });

        container.on('pointerover', (pointer) => {
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
            container.setDepth(10);
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
            container.setDepth(10);
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

        this.renderProceduralShape(container, item);
        this.snap(item);
        this.setGrid(item, item);
        this.calculateSynergies();

        return item;
    }

    findEmptySlot(item) {
        for (let y = 0; y <= GRID_HEIGHT - item.height; y++) {
            for (let x = 0; x <= GRID_WIDTH - item.width; x++) {
                if (this.canPlace(item, x, y)) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    removeItem(item) {
        this.setGrid(item, null);
        this.placedItems = this.placedItems.filter(i => i !== item);
        if (item.el) item.el.destroy();
        this.calculateSynergies();
    }

    renderProceduralShape(container, data) {
        container.removeAll(true);

        const baseG = this.scene.add.graphics();
        const detailG = this.scene.add.graphics();

        container.add(baseG);
        container.add(detailG);

        const color = ELEMENT_COLORS[data.element] || 0x64748b;
        const alpha = 0.9; // Higher base alpha
        const check = (x, y) => data.shape[y] && data.shape[y][x];

        // Draw Base
        data.shape.forEach((row, dy) => {
            row.forEach((v, dx) => {
                if (v) {
                    const ox = dx * SLOT_SIZE - (data.width * SLOT_SIZE) / 2;
                    const oy = dy * SLOT_SIZE - (data.height * SLOT_SIZE) / 2;

                    // Seamless Fill Base
                    baseG.fillStyle(color, alpha);
                    baseG.fillRect(ox, oy, SLOT_SIZE, SLOT_SIZE);

                    // Contour Outline Logic
                    baseG.lineStyle(2, 0xffffff, 0.8);
                    if (!check(dx, dy - 1)) { baseG.beginPath(); baseG.moveTo(ox, oy); baseG.lineTo(ox + SLOT_SIZE, oy); baseG.stroke(); }
                    if (!check(dx, dy + 1)) { baseG.beginPath(); baseG.moveTo(ox, oy + SLOT_SIZE); baseG.lineTo(ox + SLOT_SIZE, oy + SLOT_SIZE); baseG.stroke(); }
                    if (!check(dx - 1, dy)) { baseG.beginPath(); baseG.moveTo(ox, oy); baseG.lineTo(ox, oy + SLOT_SIZE); baseG.stroke(); }
                    if (!check(dx + 1, dy)) { baseG.beginPath(); baseG.moveTo(ox + SLOT_SIZE, oy); baseG.lineTo(ox + SLOT_SIZE, oy + SLOT_SIZE); baseG.stroke(); }
                }
            });
        });

        this.renderUniqueDetail(detailG, data);

        // Synergy Glow (Inner Border - Color Coded)
        if (data.isSynergetic) {
            const glow = this.scene.add.graphics();
            container.add(glow); // Add on TOP for Inner Border effect

            const synColors = {
                fire: 0xff5555,   // Red-Orange
                ice: 0x33ddff,    // Bright Cyan
                thunder: 0xffeb3b,// Yellow
                leaf: 0x4caf50,   // Green
                gem: 0xe040fb     // Purple
            };
            const glowColor = synColors[data.element] || 0xffd700;

            glow.lineStyle(4, glowColor, 1.0);

            data.shape.forEach((row, dy) => {
                row.forEach((v, dx) => {
                    if (v) {
                        const ox = dx * SLOT_SIZE - (data.width * SLOT_SIZE) / 2;
                        const oy = dy * SLOT_SIZE - (data.height * SLOT_SIZE) / 2;

                        // Draw glow ONLY on outer edges
                        if (!check(dx, dy - 1)) { glow.beginPath(); glow.moveTo(ox, oy); glow.lineTo(ox + SLOT_SIZE, oy); glow.stroke(); }
                        if (!check(dx, dy + 1)) { glow.beginPath(); glow.moveTo(ox, oy + SLOT_SIZE); glow.lineTo(ox + SLOT_SIZE, oy + SLOT_SIZE); glow.stroke(); }
                        if (!check(dx - 1, dy)) { glow.beginPath(); glow.moveTo(ox, oy); glow.lineTo(ox, oy + SLOT_SIZE); glow.stroke(); }
                        if (!check(dx + 1, dy)) { glow.beginPath(); glow.moveTo(ox + SLOT_SIZE, oy); glow.lineTo(ox + SLOT_SIZE, oy + SLOT_SIZE); glow.stroke(); }
                    }
                });
            });
        }
    }

    renderUniqueDetail(g, data) {
        const w = data.width * SLOT_SIZE;
        const h = data.height * SLOT_SIZE;

        g.fillStyle(0xffffff, 0.9);
        g.lineStyle(2, 0xffffff, 0.9);

        // Common symbol helper
        const drawSymbol = (type, x, y, scale = 1) => {
            const sz = SLOT_SIZE * 0.4 * scale;
            if (type === 'fire') g.fillTriangle(x, y - sz, x - sz, y + sz * 0.8, x + sz, y + sz * 0.8);
            if (type === 'ice') {
                g.beginPath(); g.moveTo(x, y - sz); g.lineTo(x + sz, y); g.lineTo(x, y + sz); g.lineTo(x - sz, y); g.closePath(); g.fill();
            }
            if (type === 'thunder') {
                g.beginPath(); g.moveTo(x + sz * 0.4, y - sz); g.lineTo(x - sz * 0.2, y - sz * 0.1); g.lineTo(x + sz * 0.6, y - sz * 0.1);
                g.lineTo(x - sz * 0.4, y + sz); g.lineTo(x + sz * 0.2, y + sz * 0.1); g.lineTo(x - sz * 0.6, y + sz * 0.1); g.closePath(); g.fill();
            }
            if (type === 'leaf') g.fillCircle(x, y, sz * 0.8);
            if (type === 'gem') {
                const r = sz * 0.7; g.fillRect(x - r, y - r, r * 2, r * 2);
                const r2 = sz * 0.9; g.beginPath(); g.moveTo(x, y - r2); g.lineTo(x + r2, y); g.lineTo(x, y + r2); g.lineTo(x - r2, y); g.closePath(); g.fill();
            }
        };

        if (data.type === 'tablet') {
            // Tech patterns on corners
            g.fillStyle(0x000000, 0.3);
            g.fillRect(-w / 2 + 4, -h / 2 + 4, 12, 12);
            g.fillRect(w / 2 - 16, h / 2 - 16, 12, 12);
            g.lineStyle(2, 0xffffff, 0.3);
            g.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
            return;
        }

        switch (data.id) {
            case 'thunder_rapier': // 1x2 Vertical
                g.beginPath();
                g.moveTo(0, -h / 2 + 10); g.lineTo(8, -h / 4); g.lineTo(4, h / 2 - 20); g.lineTo(0, h / 2 - 5); g.lineTo(-4, h / 2 - 20); g.lineTo(-8, -h / 4);
                g.closePath(); g.fill();
                g.strokeCircle(0, h / 2 - 25, 12);
                g.lineBetween(-12, h / 2 - 25, 12, h / 2 - 25);
                break;

            case 'thunder_heavy': // 2x2 [[1,1],[1,0]] Top Bar + Bot Left
                // Hammer Head (Top Row)
                g.fillRect(-w / 2 + 10, -h / 2 + 10, w - 20, 30);
                // Handle (Left Col)
                g.fillRect(-w / 4 - 10, -h / 2 + 40, 20, h - 50);
                // Detail
                g.lineStyle(2, 0xaaddff, 0.8);
                g.lineBetween(-w / 4, -h / 2 + 25, w / 4, -h / 2 + 25); // on head
                g.lineStyle(2, 0xffffff, 0.9);
                break;

            case 'fire_laser': // 3x1 Horizontal
                g.fillRect(-w / 2 + 15, -10, w - 30, 20);
                g.lineBetween(-w / 2 + 30, -10, -w / 2 + 30, 10);
                g.lineBetween(-w / 2 + 50, -10, -w / 2 + 50, 10);
                g.fillCircle(-w / 2 + 15, 0, 8);
                break;

            case 'gem_laser': // 2x2 [[1,1],[0,1]] Top Bar + Bot Right
                // Elbow Connectors
                g.lineStyle(4, 0xffffff, 0.9);
                g.lineBetween(-w / 2 + 20, -h / 4, w / 2 - 20, -h / 4); // Top Horiz
                g.lineBetween(w / 4, -h / 4, w / 4, h / 2 - 20); // Right Vert
                g.fillStyle(0xffffff, 1);
                g.fillCircle(w / 4, -h / 4, 12); // Joint
                g.fillCircle(-w / 2 + 20, -h / 4, 8); // Start
                g.fillCircle(w / 4, h / 2 - 20, 8); // End
                break;

            case 'ice_nova': // 2x1
                g.strokeCircle(0, 0, 20);
                g.lineBetween(0, -25, 0, 25);
                g.lineBetween(-20, -15, 20, 15);
                g.lineBetween(20, -15, -20, 15);
                break;

            case 'leaf_blast': // 2x2 [[1,0],[1,1]] Top Left + Bot Bar
                // Roots on Bottom
                g.lineStyle(3, 0x88ff88, 0.8);
                g.beginPath();
                g.moveTo(-w / 2 + 10, h / 4);
                g.lineTo(0, h / 2 - 5);
                g.lineTo(w / 2 - 10, h / 4);
                g.stroke();
                // Flower on Top Left
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(-w / 4, -h / 4, 15);
                g.lineStyle(2, 0xffffff, 0.9);
                g.lineBetween(-w / 4, -h / 4, -w / 4, h / 4); // Stem
                break;

            case 'fire_cannon': // 2x1
                g.strokeCircle(0, 0, 22);
                g.fillRect(-12, -12, 24, 24);
                g.strokeRect(-15, -30, 30, 10);
                break;

            case 'leaf_bow': // 1x3 Vertical
                g.beginPath(); g.moveTo(-5, -h / 2 + 15); g.lineTo(20, -h / 4); g.lineTo(10, 0); g.lineTo(20, h / 4); g.lineTo(-5, h / 2 - 15); g.stroke();
                g.lineBetween(-5, -h / 2 + 15, -5, h / 2 - 15);
                break;

            case 'judgement_prism': // 2x2 [[1,0],[1,1]] Top Left + Bot Bar
                // Base on Bottom
                g.fillRect(-w / 2 + 20, h / 4 - 5, w - 40, 10);
                // Floating Prism Top Left
                g.beginPath();
                g.moveTo(-w / 4, -h / 2 + 20); g.lineTo(-w / 4 + 15, -h / 4 + 20); g.lineTo(-w / 4 - 15, -h / 4 + 20);
                g.closePath(); g.stroke();
                // Connection
                g.lineBetween(-w / 4, -h / 4 + 20, -w / 4, h / 4 - 5);
                break;

            case 'chaos_orb': // 2x2 [[1,1],[1,0]] Top Bar + Bot Left
                g.strokeCircle(-w / 4, -h / 4, 10); // Top Left
                g.strokeCircle(w / 4, -h / 4, 10); // Top Right
                g.strokeCircle(-w / 4, h / 4, 10); // Bot Left
                g.lineBetween(-w / 4 + 10, -h / 4, w / 4 - 10, -h / 4);
                g.lineBetween(-w / 4, -h / 4 + 10, -w / 4, h / 4 - 10);
                g.lineBetween(w / 4, -h / 4 + 7, -w / 4 + 7, h / 4 - 7); // Diagonal
                break;

            default:
                drawSymbol(data.element, 0, 0, 1.5);
        }
    }

    rotateItem(item) {
        const rows = item.shape.length, cols = item.shape[0].length;
        const newShape = Array(cols).fill().map(() => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) newShape[x][rows - 1 - y] = item.shape[y][x];

        const oldShape = item.shape, oldW = item.width, oldH = item.height;
        this.setGrid(item, null);
        item.shape = newShape; item.width = oldH; item.height = oldW;

        if (!this.canPlace(item, item.gridPos.x, item.gridPos.y)) {
            // Try to find a valid spot for rotated item around current center?
            // For now, simple revert
            item.shape = oldShape; item.width = oldW; item.height = oldH;
        } else {
            this.renderProceduralShape(item.el, item);
        }
        this.setGrid(item, item);
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

    calculateSynergies() {
        const { activeCombos } = this._calculateSynergiesLogic(this.placedItems, SLOT_SIZE);
        this.placedItems.forEach(item => { if (item.el) this.renderProceduralShape(item.el, item); });
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
        });

        // Apply Tablet Buffs
        placedItems.forEach(tablet => {
            if (tablet.type === 'tablet' && tablet.buff) {
                placedItems.forEach(target => {
                    if (target !== tablet && target.type === 'artifact' && this._areAdjacent(tablet, target, slotSize)) {
                        if (tablet.buff.type === 'atk') {
                            target.currentAtk *= (1 + tablet.buff.val / 100);
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
