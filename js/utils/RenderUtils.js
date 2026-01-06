import { SLOT_SIZE, ELEMENT_COLORS, THEME } from '../constants.js';

export class RenderUtils {
    /**
     * Render the block shape and details for a grid item.
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.Container} container 
     * @param {Object} data Item data
     */
    static renderProceduralShape(scene, container, data) {
        container.removeAll(true);

        const baseG = scene.add.graphics();
        const detailG = scene.add.graphics();

        container.add(baseG);
        container.add(detailG);

        const color = ELEMENT_COLORS[data.element] || 0x64748b;
        const alpha = 0.9;
        const check = (x, y) => data.shape[y] && data.shape[y][x];

        // Draw Base
        data.shape.forEach((row, dy) => {
            row.forEach((v, dx) => {
                if (v) {
                    const ox = dx * SLOT_SIZE - (data.width * SLOT_SIZE) / 2;
                    const oy = dy * SLOT_SIZE - (data.height * SLOT_SIZE) / 2;

                    // Seamless Fill Base with Margins
                    const GAP = 4;
                    let mx = 0, my = 0, mw = SLOT_SIZE, mh = SLOT_SIZE;

                    if (!check(dx - 1, dy)) { mx += GAP; mw -= GAP; } // No Left Neighbor
                    if (!check(dx + 1, dy)) { mw -= GAP; }            // No Right Neighbor
                    if (!check(dx, dy - 1)) { my += GAP; mh -= GAP; } // No Top Neighbor
                    if (!check(dx, dy + 1)) { mh -= GAP; }            // No Bottom Neighbor

                    baseG.fillStyle(color, alpha);
                    baseG.fillRect(ox + mx, oy + my, mw, mh);
                }
            });
        });

        this.renderUniqueDetail(detailG, data);

        // Synergy Glow (Inner Border)
        if (data.isSynergetic) {
            const glow = scene.add.graphics();
            container.add(glow);

            const synColors = {
                fire: 0xff5555,
                ice: 0x33ddff,
                thunder: 0xffeb3b,
                leaf: 0x4caf50,
                gem: 0xe040fb
            };
            const glowColor = synColors[data.element] || 0xffd700;

            // Use 4px width, inset by 2px to keep it purely inside
            const lineWidth = 4;
            const offset = 2; // Half of line width to center it inside
            const GAP = 4;    // Match the gap used in base rendering

            glow.lineStyle(lineWidth, glowColor, 1.0);

            data.shape.forEach((row, dy) => {
                row.forEach((v, dx) => {
                    if (v) {
                        const ox = dx * SLOT_SIZE - (data.width * SLOT_SIZE) / 2;
                        const oy = dy * SLOT_SIZE - (data.height * SLOT_SIZE) / 2;

                        const hasLeft = check(dx - 1, dy);
                        const hasRight = check(dx + 1, dy);
                        const hasTop = check(dx, dy - 1);
                        const hasBottom = check(dx, dy + 1);

                        // Calculate visual boundaries based on neighbors/gap
                        const vx1 = ox + (hasLeft ? 0 : GAP);
                        const vx2 = ox + SLOT_SIZE - (hasRight ? 0 : GAP);
                        const vy1 = oy + (hasTop ? 0 : GAP);
                        const vy2 = oy + SLOT_SIZE - (hasBottom ? 0 : GAP);

                        // Draw inset lines based on boundaries using lineBetween
                        if (!hasTop) {
                            glow.lineBetween(vx1, vy1 + offset, vx2, vy1 + offset);
                        }
                        if (!hasBottom) {
                            glow.lineBetween(vx1, vy2 - offset, vx2, vy2 - offset);
                        }
                        if (!hasLeft) {
                            glow.lineBetween(vx1 + offset, vy1, vx1 + offset, vy2);
                        }
                        if (!hasRight) {
                            glow.lineBetween(vx2 - offset, vy1, vx2 - offset, vy2);
                        }
                    }
                });
            });
        }
    }

    static renderUniqueDetail(g, data) {
        const w = data.width * SLOT_SIZE;
        const h = data.height * SLOT_SIZE;

        g.fillStyle(0xffffff, 0.9);
        g.lineStyle(2, 0xffffff, 0.9);

        // Helper for common symbols
        const drawSymbol = (type, x, y, scale = 1) => {
            const sz = SLOT_SIZE * 0.4 * scale;
            if (type === 'fire') g.fillTriangle(x, y - sz, x - sz, y + sz * 0.8, x + sz, y + sz * 0.8);
            if (type === 'ice') {
                g.fillPoints([
                    { x: x, y: y - sz },
                    { x: x + sz, y: y },
                    { x: x, y: y + sz },
                    { x: x - sz, y: y }
                ], true);
            }
            if (type === 'thunder') {
                g.fillPoints([
                    { x: x + sz * 0.4, y: y - sz },
                    { x: x - sz * 0.2, y: y - sz * 0.1 },
                    { x: x + sz * 0.6, y: y - sz * 0.1 },
                    { x: x - sz * 0.4, y: y + sz },
                    { x: x + sz * 0.2, y: y + sz * 0.1 },
                    { x: x - sz * 0.6, y: y + sz * 0.1 }
                ], true);
            }
            if (type === 'leaf') g.fillCircle(x, y, sz * 0.8);
            if (type === 'gem') {
                const r = sz * 0.7; g.fillRect(x - r, y - r, r * 2, r * 2);
                const r2 = sz * 0.9;
                g.fillPoints([
                    { x: x, y: y - r2 },
                    { x: x + r2, y: y },
                    { x: x, y: y + r2 },
                    { x: x - r2, y: y }
                ], true);
            }
        };

        if (data.type === 'tablet') {
            g.fillStyle(0x000000, 0.3);
            g.fillRect(-w / 2 + 4, -h / 2 + 4, 12, 12);
            g.fillRect(w / 2 - 16, h / 2 - 16, 12, 12);
            g.lineStyle(2, 0xffffff, 0.3);
            g.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
            return;
        }

        switch (data.id) {
            case 'thunder_rapier':
                // Thunder Rapier: Jagged Blade
                g.fillPoints([
                    { x: 0, y: -h / 2 + 10 },
                    { x: 8, y: -h / 4 },
                    { x: 4, y: h / 2 - 20 },
                    { x: 0, y: h / 2 - 5 },
                    { x: -4, y: h / 2 - 20 },
                    { x: -8, y: -h / 4 }
                ], true);
                g.strokeCircle(0, h / 2 - 25, 12);
                g.lineBetween(-12, h / 2 - 25, 12, h / 2 - 25);
                break;
            case 'thunder_heavy':
                g.fillRect(-w / 2 + 10, -h / 2 + 10, w - 20, 30);
                g.fillRect(-w / 4 - 10, -h / 2 + 40, 20, h - 50);
                g.lineStyle(2, 0xaaddff, 0.8);
                g.lineBetween(-w / 4, -h / 2 + 25, w / 4, -h / 2 + 25);
                g.lineStyle(2, 0xffffff, 0.9);
                break;
            case 'fire_laser':
                g.fillRect(-w / 2 + 15, -10, w - 30, 20);
                g.lineBetween(-w / 2 + 30, -10, -w / 2 + 30, 10);
                g.lineBetween(-w / 2 + 50, -10, -w / 2 + 50, 10);
                g.fillCircle(-w / 2 + 15, 0, 8);
                break;
            case 'gem_laser':
                g.lineStyle(4, 0xffffff, 0.9);
                g.lineBetween(-w / 2 + 20, -h / 4, w / 2 - 20, -h / 4);
                g.lineBetween(w / 4, -h / 4, w / 4, h / 2 - 20);
                g.fillStyle(0xffffff, 1);
                g.fillCircle(w / 4, -h / 4, 12);
                g.fillCircle(-w / 2 + 20, -h / 4, 8);
                g.fillCircle(w / 4, h / 2 - 20, 8);
                break;
            case 'ice_nova':
                g.strokeCircle(0, 0, 20);
                g.lineBetween(0, -25, 0, 25);
                g.lineBetween(-20, -15, 20, 15);
                g.lineBetween(20, -15, -20, 15);
                break;
            case 'leaf_blast':
                g.lineStyle(3, 0x88ff88, 0.8);
                g.strokePoints([
                    { x: -w / 2 + 10, y: h / 4 },
                    { x: 0, y: h / 2 - 5 },
                    { x: w / 2 - 10, y: h / 4 }
                ], false);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(-w / 4, -h / 4, 15);
                g.lineStyle(2, 0xffffff, 0.9);
                g.lineBetween(-w / 4, -h / 4, -w / 4, h / 4);
                break;
            case 'fire_cannon':
                g.strokeCircle(0, 0, 22);
                g.fillRect(-12, -12, 24, 24);
                g.strokeRect(-15, -30, 30, 10);
                break;
            case 'leaf_bow':
                g.strokePoints([
                    { x: -5, y: -h / 2 + 15 },
                    { x: 20, y: -h / 4 },
                    { x: 10, y: 0 },
                    { x: 20, y: h / 4 },
                    { x: -5, y: h / 2 - 15 }
                ], false);
                g.lineBetween(-5, -h / 2 + 15, -5, h / 2 - 15);
                break;
            case 'judgement_prism':
                g.fillRect(-w / 2 + 20, h / 4 - 5, w - 40, 10);
                g.strokeTriangle(
                    -w / 4, -h / 2 + 20,
                    -w / 4 + 15, -h / 4 + 20,
                    -w / 4 - 15, -h / 4 + 20
                );
                g.lineBetween(-w / 4, -h / 4 + 20, -w / 4, h / 4 - 5);
                break;
            case 'chaos_orb':
                g.strokeCircle(-w / 4, -h / 4, 10);
                g.strokeCircle(w / 4, -h / 4, 10);
                g.strokeCircle(-w / 4, h / 4, 10);
                g.lineBetween(-w / 4 + 10, -h / 4, w / 4 - 10, -h / 4);
                g.lineBetween(-w / 4, -h / 4 + 10, -w / 4, h / 4 - 10);
                g.lineBetween(w / 4, -h / 4 + 7, -w / 4 + 7, h / 4 - 7);
                break;
            default:
                drawSymbol(data.element, 0, 0, 1.5);
        }
    }

    static renderMonsterByType(g, type) {
        const size = type.size;
        const color = type.color;

        if (type.id === 'slime') {
            g.fillStyle(color, 0.8);
            g.fillEllipse(0, 0, size, size * 0.8);
            g.fillStyle(0xffffff, 0.4);
            g.fillCircle(-size / 5, -size / 5, size / 6);
            g.fillStyle(0x000000, 0.2);
            g.fillCircle(0, 5, size / 4);
        }
        else if (type.id === 'guardian') {
            g.lineStyle(3, 0xffffff, 0.5);
            g.fillStyle(color, 1);
            const pts = [0, -size / 2, size / 2, 0, 0, size / 2, -size / 2, 0];
            g.fillPoints(pts.map((p, i) => ({ x: pts[i * 2], y: pts[i * 2 + 1] })), true);
            g.strokePoints(pts.map((p, i) => ({ x: pts[i * 2], y: pts[i * 2 + 1] })), true);
            g.fillStyle(0xfacc15, 1);
            g.fillCircle(0, 0, size / 5);
            g.lineStyle(1, 0xffffff, 1);
            g.strokeCircle(0, 0, size / 5);
            g.lineStyle(2, color, 0.6);
            g.strokeCircle(0, 0, size / 1.5);
        }
        else if (type.id === 'spirit') {
            g.fillStyle(color, 0.6);
            for (let i = 0; i < 4; i++) {
                const offX = (Math.random() - 0.5) * size / 2;
                const offY = (Math.random() - 0.5) * size / 2;
                g.fillCircle(offX, offY, size / 2);
            }
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(0, 0, size / 4);
        }
        else if (type.id === 'golem') {
            g.fillStyle(color, 1);
            g.lineStyle(2, 0x000000, 0.4);
            g.fillRoundedRect(-size / 2.2, -size / 4, size / 1.1, size / 2, 8);
            g.strokeRoundedRect(-size / 2.2, -size / 4, size / 1.1, size / 2, 8);
            g.fillCircle(-size / 2.5, -size / 5, size / 3.5);
            g.strokeCircle(-size / 2.5, -size / 5, size / 3.5);
            g.fillCircle(size / 2.5, -size / 5, size / 3.5);
            g.strokeCircle(size / 2.5, -size / 5, size / 3.5);
            g.fillRoundedRect(-size / 4, -size / 2.2, size / 2, size / 3, 5);
            g.strokeRoundedRect(-size / 4, -size / 2.2, size / 2, size / 3, 5);
            g.lineStyle(1, 0x000000, 0.3);
            g.lineBetween(-size / 4, 0, size / 4, size / 5);
            g.lineBetween(0, -size / 4, -size / 5, size / 4);
            g.fillStyle(0xff0000, 1);
            g.fillCircle(-size / 8, -size / 3, size / 15);
            g.fillCircle(size / 8, -size / 3, size / 15);
            g.fillStyle(0xef4444, 0.3);
            g.fillCircle(0, 0, size / 6);
        }
    }

    static createHitEffect(scene, x, y, element) {
        const colors = ELEMENT_COLORS;
        const color = colors[element] || 0xffffff;

        const g = scene.add.graphics();
        g.setDepth(28);
        g.setBlendMode(Phaser.BlendModes.ADD);

        // Core Flash
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, y, 5);
        g.fillStyle(color, 0.6);
        g.fillCircle(x, y, 12);

        // Element Specifics
        if (element === 'fire') {
            g.lineStyle(2, 0xffaa00, 1);
            g.strokeCircle(x, y, 14);
        } else if (element === 'ice') {
            g.lineStyle(2, 0xaaddff, 1);
            g.lineBetween(x - 8, y - 8, x + 8, y + 8);
            g.lineBetween(x - 8, y + 8, x + 8, y - 8);
        } else if (element === 'thunder') {
            g.lineStyle(2, 0xffffaa, 1);
            g.strokeRect(x - 6, y - 6, 12, 12);
        } else if (element === 'gem') {
            g.lineStyle(2, 0xff00ff, 1);
            g.lineBetween(x - 10, y, x + 10, y);
            g.lineBetween(x, y - 10, x, y + 10);
        } else {
            g.lineStyle(2, 0x88ff88, 1);
            g.strokeCircle(x, y, 12);
        }

        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: 250,
            onComplete: () => g.destroy()
        });
    }

    static createProjectile(scene, x, y, element) {
        const proj = scene.add.graphics();
        proj.x = x;
        proj.y = y;
        proj.setDepth(25);
        proj.setBlendMode(Phaser.BlendModes.ADD);
        scene.physics.add.existing(proj);

        if (element === 'ice') {
            proj.lineStyle(3, 0x33ddff, 1);
            proj.lineBetween(0, -14, 0, 14);
            proj.lineBetween(-12, -7, 12, 7);
            proj.lineBetween(-12, 7, 12, -7);
            proj.fillStyle(0xffffff, 1);
            proj.fillCircle(0, 0, 5);
            scene.tweens.add({ targets: proj, angle: 360, duration: 400, repeat: -1 });
        } else if (element === 'fire') {
            proj.fillStyle(0xff3300, 0.5); proj.fillCircle(0, 0, 14);
            proj.fillStyle(0xff8800, 0.8); proj.fillCircle(0, 0, 9);
            proj.fillStyle(0xffffaa, 1); proj.fillCircle(0, 0, 5);
        } else if (element === 'gem') {
            proj.lineStyle(3, 0xe040fb, 1);
            proj.strokeCircle(0, 0, 10);
            proj.fillStyle(0xffffff, 1);
            proj.fillPoints([
                { x: 0, y: -12 }, { x: 3, y: -3 },
                { x: 12, y: 0 }, { x: 3, y: 3 },
                { x: 0, y: 12 }, { x: -3, y: 3 },
                { x: -12, y: 0 }, { x: -3, y: -3 }
            ], true);
            scene.tweens.add({ targets: proj, angle: -360, duration: 600, repeat: -1 });
        } else if (element === 'leaf') {
            proj.fillStyle(0x4caf50, 1);
            proj.fillCircle(-6, -6, 5); proj.fillCircle(6, -6, 5);
            proj.fillCircle(-6, 6, 5); proj.fillCircle(6, 6, 5);
            proj.fillStyle(0xffffaa, 1); proj.fillCircle(0, 0, 5);
            scene.tweens.add({ targets: proj, angle: 360, duration: 800, repeat: -1 });
        } else {
            proj.fillStyle(0xffff00, 0.8); proj.fillCircle(0, 0, 8);
            proj.lineStyle(2, 0xffffff, 1);
            proj.strokeRect(-6, -6, 12, 12);
            scene.tweens.add({ targets: proj, angle: 360, duration: 200, repeat: -1 });
        }
        return proj;
    }
}
