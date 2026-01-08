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
        const frameG = scene.add.graphics(); // For borders/structure
        const detailG = scene.add.graphics(); // For icons/symbols

        container.add(baseG);
        container.add(frameG);
        container.add(detailG);

        const color = ELEMENT_COLORS[data.element] || 0x64748b;
        const darkColor = this.getDarkColor(data.element);
        
        const check = (x, y) => data.shape[y] && data.shape[y][x];

        // 1. Base & Frame Rendering
        data.shape.forEach((row, dy) => {
            row.forEach((v, dx) => {
                if (v) {
                    const ox = dx * SLOT_SIZE - (data.width * SLOT_SIZE) / 2;
                    const oy = dy * SLOT_SIZE - (data.height * SLOT_SIZE) / 2;
                    const s = SLOT_SIZE;

                    // -- Inner Core --
                    // Dark metallic base
                    baseG.fillStyle(0x0f172a, 1); 
                    baseG.fillRect(ox + 1, oy + 1, s - 2, s - 2);
                    
                    // Element Tint (Glass effect)
                    baseG.fillStyle(color, 0.15);
                    baseG.fillRect(ox + 3, oy + 3, s - 6, s - 6);

                    // Scanlines (Tech texture)
                    baseG.fillStyle(color, 0.1);
                    for(let i = 4; i < s - 4; i += 3) {
                        baseG.fillRect(ox + 3, oy + i, s - 6, 1);
                    }

                    // -- Frame / Hull --
                    const hasUp = check(dx, dy - 1);
                    const hasDown = check(dx, dy + 1);
                    const hasLeft = check(dx - 1, dy);
                    const hasRight = check(dx + 1, dy);

                    const bezel = 4; // Thickness of the outer frame

                    // Main Frame Color
                    frameG.fillStyle(darkColor, 1);

                    // Edges
                    if (!hasUp) frameG.fillRect(ox, oy, s, bezel);
                    if (!hasDown) frameG.fillRect(ox, oy + s - bezel, s, bezel);
                    if (!hasLeft) frameG.fillRect(ox, oy, bezel, s);
                    if (!hasRight) frameG.fillRect(ox + s - bezel, oy, bezel, s);

                    // Corner Bolts / Highlights
                    frameG.fillStyle(color, 1);
                    const bolt = 3;
                    // Draw bolts on outer corners
                    if (!hasUp && !hasLeft) frameG.fillRect(ox, oy, bolt, bolt);
                    if (!hasUp && !hasRight) frameG.fillRect(ox + s - bolt, oy, bolt, bolt);
                    if (!hasDown && !hasLeft) frameG.fillRect(ox, oy + s - bolt, bolt, bolt);
                    if (!hasDown && !hasRight) frameG.fillRect(ox + s - bolt, oy + s - bolt, bolt, bolt);

                    // Connectors (Between cells)
                    frameG.fillStyle(darkColor, 0.5);
                    if (hasRight) {
                        // Horizontal connector
                        frameG.fillRect(ox + s - 2, oy + s/2 - 4, 4, 8);
                    }
                    if (hasDown) {
                        // Vertical connector
                        frameG.fillRect(ox + s/2 - 4, oy + s - 2, 8, 4);
                    }
                }
            });
        });

        this.renderUniqueDetail(detailG, data);

        // Synergy Glow (Outer Aura) - 시너지 효과 제거
        // if (data.isSynergetic || data.activeSynergy) {
        //     // ... 효과 제거 ...
        // }
    }

    static getDarkColor(element) {
        const map = {
            fire: 0x7f1d1d,   // Red-900
            ice: 0x0c4a6e,    // Sky-900
            thunder: 0x713f12, // Yellow-900
            leaf: 0x064e3b,   // Emerald-900
            gem: 0x581c87,    // Purple-900
            shadow: 0x4c1d95, // Violet-900
            plasma: 0xa21caf, // Fuchsia-700
            mystic: 0x4338ca, // Indigo-700
            tablet: 0x27272a, // Zinc-800
            artifact: 0x27272a
        };
        return map[element] || 0x334155;
    }

    static renderUniqueDetail(g, data) {
        const w = data.width * SLOT_SIZE;
        const h = data.height * SLOT_SIZE;

        // Reset
        g.fillStyle(0xffffff, 0.9);
        g.lineStyle(2, 0xffffff, 0.9);

        // Helper for common symbols
        const drawSymbol = (type, x, y, scale = 1) => {
            const sz = SLOT_SIZE * 0.3 * scale;
            
            // Drop Shadow / Glow
            g.fillStyle(0x000000, 0.5);
            g.fillCircle(x + 2, y + 2, sz);

            const color = ELEMENT_COLORS[type] || 0xffffff;
            g.fillStyle(color, 1);
            g.lineStyle(2, 0xffffff, 0.8);

            if (type === 'fire') {
                // Tech Flame (Triangle + Core)
                g.fillTriangle(x, y - sz, x - sz*0.8, y + sz*0.8, x + sz*0.8, y + sz*0.8);
                g.fillStyle(0xffffff, 0.8);
                g.fillTriangle(x, y - sz*0.5, x - sz*0.3, y + sz*0.5, x + sz*0.3, y + sz*0.5);
            }
            else if (type === 'ice') {
                // Hex Crystal using Phaser.Geom.Circle to generate points
                const circle = new Phaser.Geom.Circle(x, y, sz);
                const points = circle.getPoints(6);
                g.fillPoints(points, true);
                g.strokePoints(points, true);
            }
            else if (type === 'thunder') {
                // Jagged Bolt
                g.beginPath();
                g.moveTo(x + sz * 0.3, y - sz);
                g.lineTo(x - sz * 0.2, y - sz * 0.1);
                g.lineTo(x + sz * 0.4, y - sz * 0.1);
                g.lineTo(x - sz * 0.4, y + sz);
                g.lineTo(x + sz * 0.2, y + sz * 0.1);
                g.lineTo(x - sz * 0.5, y + sz * 0.1);
                g.closePath();
                g.fillPath();
                g.strokePath();
            }
            else if (type === 'leaf') {
                // Bio Hazard-ish
                g.fillCircle(x, y - sz*0.4, sz*0.4);
                g.fillCircle(x - sz*0.4, y + sz*0.3, sz*0.4);
                g.fillCircle(x + sz*0.4, y + sz*0.3, sz*0.4);
                g.fillStyle(0x000000, 0.3);
                g.fillCircle(x, y, sz*0.2);
            }
            else if (type === 'gem') {
                // Diamond
                g.beginPath();
                g.moveTo(x, y - sz);
                g.lineTo(x + sz*0.8, y);
                g.lineTo(x, y + sz);
                g.lineTo(x - sz*0.8, y);
                g.closePath();
                g.fillPath();
                g.strokePath();
            }
            else if (type === 'shadow') {
                // Void Eye
                g.fillCircle(x, y, sz);
                g.fillStyle(0x000000, 1);
                g.beginPath();
                g.arc(x, y - sz*0.2, sz*0.7, 0, Math.PI, false);
                g.fillPath();
            }
            else if (type === 'plasma') {
                // Atom / Orbit
                g.strokeCircle(x, y, sz);
                g.strokeEllipse(x, y, sz*1.2, sz*0.5);
                g.fillCircle(x, y, sz*0.4);
            }
            else if (type === 'mystic') {
                // Rune Square
                g.strokeRect(x - sz*0.7, y - sz*0.7, sz*1.4, sz*1.4);
                g.strokeRect(x - sz*0.7, y - sz*0.7, sz*1.4, sz*1.4); // Double weight
                g.fillCircle(x, y, sz*0.3);
                g.lineBetween(x - sz, y, x + sz, y);
                g.lineBetween(x, y - sz, x, y + sz);
            }
            else {
                // Fallback
                g.fillCircle(x, y, sz);
            }
        };

        if (data.type === 'tablet') {
            // Futuristic Module Design
            // Base plate with metallic finish
            g.fillStyle(0x18181b, 1); // Dark Zinc
            g.fillRoundedRect(-w/2 + 4, -h/2 + 4, w - 8, h - 8, 6);
            
            // Inner recessed panel
            g.fillStyle(0x09090b, 1); // Blacker
            g.fillRoundedRect(-w/2 + 8, -h/2 + 8, w - 16, h - 16, 4);

            // Tech Corners
            g.fillStyle(0x52525b, 1);
            const cs = 6; // Corner size
            g.fillRect(-w/2 + 4, -h/2 + 4, cs, 2);
            g.fillRect(-w/2 + 4, -h/2 + 4, 2, cs);
            g.fillRect(w/2 - 4 - cs, -h/2 + 4, cs, 2);
            g.fillRect(w/2 - 6, -h/2 + 4, 2, cs);
            g.fillRect(-w/2 + 4, h/2 - 6, cs, 2);
            g.fillRect(-w/2 + 4, h/2 - 4 - cs, 2, cs);
            g.fillRect(w/2 - 4 - cs, h/2 - 6, cs, 2);
            g.fillRect(w/2 - 6, h/2 - 4 - cs, 2, cs);

            // Determine Buff Color & Icon
            const buffType = data.buff ? data.buff.type : 'atk';
            let buffColor = 0xffffff;
            if (buffType === 'atk') buffColor = 0xff4444;      // Red
            else if (buffType === 'range') buffColor = 0x44ff44; // Green
            else if (buffType === 'speed') buffColor = 0x3b82f6; // Blue
            else if (buffType === 'crit') buffColor = 0xfacc15;  // Yellow
            else if (buffType === 'area') buffColor = 0xa855f7;  // Purple

            // Central Core (Glowing)
            g.fillStyle(buffColor, 0.2);
            g.fillCircle(0, 0, 14);
            g.lineStyle(2, buffColor, 0.8);
            g.strokeCircle(0, 0, 14);
            
            // Rotating outer ring segments (static drawing)
            g.lineStyle(2, buffColor, 0.4);
            g.beginPath();
            g.arc(0, 0, 18, 0, Math.PI/2);
            g.strokePath();
            g.beginPath();
            g.arc(0, 0, 18, Math.PI, Math.PI * 1.5);
            g.strokePath();

            // Icon Symbol
            g.lineStyle(2, 0xffffff, 1);
            if (buffType === 'atk') {
                // Sword / Dagger
                g.lineBetween(-6, 6, 6, -6);
                g.lineBetween(-2, 6, 6, -2);
            } else if (buffType === 'range') {
                // Radar / Target
                g.strokeCircle(0, 0, 4);
                g.lineBetween(-8, 0, -4, 0);
                g.lineBetween(4, 0, 8, 0);
                g.lineBetween(0, -8, 0, -4);
                g.lineBetween(0, 4, 0, 8);
            } else if (buffType === 'speed') {
                // Lightning / Fast forward
                g.beginPath();
                g.moveTo(2, -6);
                g.lineTo(-4, 0);
                g.lineTo(0, 0);
                g.lineTo(-2, 6);
                g.lineTo(4, 0);
                g.lineTo(0, 0);
                g.closePath();
                g.strokePath();
            } else if (buffType === 'crit') {
                // Star / Spark
                g.lineBetween(0, -7, 0, 7);
                g.lineBetween(-7, 0, 7, 0);
                g.lineBetween(-5, -5, 5, 5);
                g.lineBetween(-5, 5, 5, -5);
            } else if (buffType === 'area') {
                // Explosion / Expanding
                g.strokeCircle(0, 0, 3);
                g.strokeCircle(0, 0, 7);
            }

            return;
        }

        // Custom renderings for specific items
        // We use the center of the item group as (0,0)
        
        const color = ELEMENT_COLORS[data.element] || 0xffffff;

        switch (data.id) {
            // --- THUNDER ---
            case 'thunder_rapier': // Energy Blade
                g.lineStyle(4, 0xffff00, 0.8); // Glow
                g.lineBetween(-10, h/2 - 10, 10, -h/2 + 10);
                g.lineStyle(2, 0xffffff, 1); // Core
                g.lineBetween(-10, h/2 - 10, 10, -h/2 + 10);
                g.fillStyle(0x555555, 1); // Handle
                g.fillCircle(-12, h/2 - 12, 6);
                break;
            case 'thunder_heavy': // Storm Pylon (Coil)
                g.fillStyle(0x333333, 1);
                g.fillRect(-10, -15, 20, 30);
                g.lineStyle(2, 0xffff00, 1);
                g.strokeRect(-10, -15, 20, 30);
                // Coil windings
                g.lineBetween(-10, -5, 10, -5);
                g.lineBetween(-10, 5, 10, 5);
                // Sparks
                g.fillStyle(0xffff00, 1);
                g.fillCircle(0, -20, 4);
                break;
            case 'thunder_static': // Stun Baton
                g.lineStyle(4, 0x555555, 1);
                g.lineBetween(-10, 20, 10, -20);
                g.fillStyle(0xffff00, 1);
                g.fillCircle(10, -20, 6); // Head
                g.lineStyle(2, 0xffff00, 1);
                g.strokeCircle(10, -20, 9); // Electric field
                break;

            // --- FIRE ---
            case 'fire_laser': // Plasma Railgun
                g.fillStyle(0x333333, 1);
                g.fillRoundedRect(-25, -6, 50, 12, 2);
                g.fillStyle(0xff5500, 1); // Core
                g.fillRect(-20, -2, 40, 4);
                break;
            case 'fire_cannon': // Mortar
                g.fillStyle(0x333333, 1);
                g.fillCircle(0, 0, 15); // Base
                g.fillStyle(0x000000, 1);
                g.fillCircle(0, 0, 10); // Bore
                g.fillStyle(0xff4400, 0.5);
                g.fillCircle(0, 0, 6); // Heat
                break;
            case 'chaos_orb': // Entropy Orbs
                g.fillStyle(0xff0000, 1);
                g.fillCircle(-10, -10, 6);
                g.fillCircle(10, 5, 5);
                g.fillCircle(-5, 10, 4);
                break;

            // --- ICE ---
            case 'ice_nova': // Cryo Core
                g.fillStyle(0x0ea5e9, 1);
                g.fillCircle(0, 0, 12);
                g.lineStyle(2, 0xffffff, 0.8);
                g.strokeCircle(0, 0, 16);
                g.lineBetween(0, -20, 0, -12); // Spikes
                g.lineBetween(0, 12, 0, 20);
                g.lineBetween(-20, 0, -12, 0);
                g.lineBetween(12, 0, 20, 0);
                break;
            case 'ice_shard': // Shard Emitter
                g.fillStyle(0x333333, 1);
                g.fillTriangle(0, -15, -10, 10, 10, 10);
                g.fillStyle(0x0ea5e9, 1);
                g.fillTriangle(0, -8, -4, 4, 4, 4);
                break;

            // --- LEAF ---
            case 'leaf_bow': // Tech Bow
                g.lineStyle(3, 0x4ade80, 1);
                g.beginPath();
                g.arc(0, 0, 20, -Math.PI/2, Math.PI/2, false);
                g.strokePath();
                g.lineStyle(1, 0xffffff, 0.5);
                g.lineBetween(0, -20, 0, 20); // String
                break;
            case 'leaf_blast': // Bio Grenade
                g.fillStyle(0x064e3b, 1);
                g.fillRoundedRect(-10, -15, 20, 30, 8);
                g.fillStyle(0x4ade80, 1); // Fluid window
                g.fillRect(-5, -5, 10, 10);
                break;
            case 'leaf_spore': // Nozzle
                g.fillStyle(0x333333, 1);
                g.fillCircle(0, 0, 10);
                g.lineStyle(3, 0x4ade80, 1);
                g.lineBetween(0, 0, 15, -15);
                g.lineBetween(0, 0, 15, 0);
                g.lineBetween(0, 0, 15, 15);
                break;

            // --- GEM ---
            case 'gem_laser': // Void Lens
                g.fillStyle(0x000000, 1);
                g.fillCircle(0, 0, 12);
                g.lineStyle(2, 0xd8b4fe, 1);
                g.strokeCircle(0, 0, 12);
                g.fillStyle(0xd8b4fe, 1);
                g.fillCircle(0, 0, 4); // Pupil
                break;
            case 'judgement_prism': // Prism
                g.fillStyle(0xd8b4fe, 0.3);
                g.lineStyle(2, 0xffffff, 1);
                g.fillTriangle(0, -15, -15, 15, 15, 15);
                g.strokeTriangle(0, -15, -15, 15, 15, 15);
                break;
            case 'gem_curse': // Eye
                g.fillStyle(0x2e1065, 1);
                g.fillEllipse(0, 0, 30, 15);
                g.fillStyle(0xd8b4fe, 1);
                g.fillCircle(0, 0, 6);
                break;

            // --- SHADOW ---
            case 'shadow_dagger': // Twin Blades
                g.fillStyle(0x7c3aed, 1);
                g.fillTriangle(-5, -5, -5, 15, -10, 15); // Left
                g.fillTriangle(5, -5, 5, 15, 10, 15); // Right
                break;
            case 'shadow_orb': // Dark Matter
                g.fillStyle(0x000000, 0.8);
                g.fillCircle(0, 0, 12);
                g.lineStyle(2, 0x7c3aed, 1);
                g.strokeCircle(0, 0, 14);
                break;
            case 'shadow_scythe': // Scythe
                g.lineStyle(3, 0x7c3aed, 1);
                g.beginPath();
                g.arc(0, 10, 20, Math.PI, 1.8 * Math.PI, false);
                g.strokePath();
                g.lineStyle(3, 0x555555, 1);
                g.lineBetween(0, -10, 0, 20); // Handle
                break;

            // --- PLASMA ---
            case 'plasma_launcher': // Wide Barrel
                g.fillStyle(0x333333, 1);
                g.fillRect(-15, -10, 30, 20);
                g.fillStyle(0xe879f9, 1);
                g.fillCircle(0, 0, 8);
                break;
            case 'plasma_flux': // Multi-barrel
                g.fillStyle(0x333333, 1);
                g.fillCircle(-8, -8, 6);
                g.fillCircle(8, -8, 6);
                g.fillCircle(0, 8, 6);
                g.fillStyle(0xe879f9, 1);
                g.fillCircle(-8, -8, 3);
                g.fillCircle(8, -8, 3);
                g.fillCircle(0, 8, 3);
                break;
            case 'plasma_core': // Reactor
                g.fillStyle(0xe879f9, 0.4);
                g.fillCircle(0, 0, 15);
                g.fillStyle(0xffffff, 1);
                g.fillCircle(0, 0, 8);
                break;

            // --- MYSTIC ---
            case 'mystic_bolt': // Rune Arrow
                g.lineStyle(3, 0x6366f1, 1);
                g.lineBetween(-10, 10, 10, -10);
                g.lineBetween(5, -10, 10, -10);
                g.lineBetween(10, -5, 10, -10);
                break;
            case 'mystic_prism': // Cluster
                g.fillStyle(0x6366f1, 1);
                g.fillCircle(0, -10, 6);
                g.fillCircle(-8, 5, 6);
                g.fillCircle(8, 5, 6);
                break;
            case 'mystic_scroll': // Holo-Scroll
                g.fillStyle(0x4338ca, 1); // Scroll case
                g.fillRect(-15, -5, 30, 10);
                g.fillStyle(0x6366f1, 0.3); // Hologram projection
                // Trapezoid using fillPoints
                g.fillPoints([
                    { x: -10, y: -25 },
                    { x: 10, y: -25 },
                    { x: 15, y: -5 },
                    { x: -15, y: -5 }
                ], true);
                break;

            default:
                drawSymbol(data.element, 0, 0, 1.2);
        }
    }

    static renderMonsterByType(g, type) {
        const size = type.size;
        const color = type.color;

        // Reset
        g.clear();

        // Common Tech Glow (Engine/Core)
        g.fillStyle(color, 0.3);
        g.fillCircle(0, 0, size * 0.6);

        if (type.id === 'slime') {
            // "Nano-Swarm": A cluster of jagged particles
            // Main Core
            g.fillStyle(color, 1);
            g.beginPath();
            g.moveTo(0, -size/2);
            g.lineTo(size/2, 0);
            g.lineTo(0, size/2);
            g.lineTo(-size/2, 0);
            g.closePath();
            g.fillPath();
            
            // Satellites
            g.fillStyle(0xffffff, 0.8);
            g.fillRect(-size/2, -size/2, size/4, size/4);
            g.fillRect(size/4, -size/4, size/4, size/4);
            g.fillRect(-size/4, size/4, size/4, size/4);
            
            // Glitch lines
            g.lineStyle(2, 0xffffff, 0.5);
            g.lineBetween(-size, 0, size, 0);
        }
        else if (type.id === 'guardian') {
            // "Heavy Mech": Angular armor
            const s = size * 0.8;
            g.fillStyle(0x333333, 1); // Dark Hull
            
            // Draw Hexagon using Phaser.Geom.Circle points
            const circle = new Phaser.Geom.Circle(0, 0, s);
            const points = circle.getPoints(6);
            g.fillPoints(points, true);

            // Armor plates
            g.lineStyle(3, color, 1);
            g.strokePoints(points, true);

            // Core Shield
            g.fillStyle(0xfacc15, 1);
            g.fillCircle(0, 0, s * 0.4);
            g.lineStyle(2, 0xffffff, 1);
            g.strokeCircle(0, 0, s * 0.4);
        }
        else if (type.id === 'spirit') {
            // "Phase Drifter": Energy core with rings
            g.lineStyle(2, color, 0.8);
            g.strokeCircle(0, 0, size * 0.8);
            g.strokeCircle(0, 0, size * 0.6);
            
            // Core
            g.fillStyle(0xffffff, 1);
            g.fillCircle(0, 0, size * 0.3);
            
            // Tail/Trail (Static representation)
            g.fillStyle(color, 0.5);
            g.fillTriangle(0, 0, -size, -size*0.5, -size, size*0.5);
        }
        else if (type.id === 'golem') {
            // "Siege Walker": Industrial bulky unit
            g.fillStyle(0x27272a, 1); // Zinc-800
            g.fillRect(-size/2, -size/2, size, size);
            
            // Hazard Stripes
            g.fillStyle(0xfacc15, 1); // Yellow
            g.beginPath();
            g.moveTo(-size/2, -size/2);
            g.lineTo(0, -size/2);
            g.lineTo(-size/2, 0);
            g.closePath();
            g.fillPath();
            
            g.beginPath();
            g.moveTo(size/2, size/2);
            g.lineTo(0, size/2);
            g.lineTo(size/2, 0);
            g.closePath();
            g.fillPath();

            // Heavy Plating
            g.lineStyle(4, 0x000000, 1);
            g.strokeRect(-size/2, -size/2, size, size);
            
            // Red Eye
            g.fillStyle(0xff0000, 1);
            g.fillRect(-size/4, -size/4, size/2, size/8);
        }
    }

    static getHitEffectTexture(scene, color) {
        const key = `hit_tex_${color}`;
        if (scene.textures.exists(key)) return key;

        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Draw Hit Effect
        // Center at 15, 15 (30x30 texture)
        
        // Core Flash
        g.fillStyle(0xffffff, 1);
        g.fillCircle(15, 15, 5);
        g.fillStyle(color, 0.6);
        g.fillCircle(15, 15, 12);

        // Generic Sparks (4 cardinal directions + diagonals)
        g.lineStyle(2, color, 0.8);
        g.lineBetween(15, 15, 15, 5);   // Up
        g.lineBetween(15, 15, 15, 25);  // Down
        g.lineBetween(15, 15, 5, 15);   // Left
        g.lineBetween(15, 15, 25, 15);  // Right
        g.lineBetween(15, 15, 8, 8);    // UL
        g.lineBetween(15, 15, 22, 22);  // DR
        g.lineBetween(15, 15, 22, 8);   // UR
        g.lineBetween(15, 15, 8, 22);   // DL

        g.generateTexture(key, 30, 30);
        g.destroy();
        
        return key;
    }

    static showHitEffect(scene, x, y, color) {
        // Handle color if passed as element string or number
        let finalColor = color;
        if (typeof color === 'string') {
             finalColor = ELEMENT_COLORS[color] || 0xffffff;
        } else if (color === undefined) {
             finalColor = 0xffffff;
        }

        const textureKey = this.getHitEffectTexture(scene, finalColor);

        if (!scene.projectileGroup) {
            scene.projectileGroup = scene.add.group({
                classType: Phaser.GameObjects.Image,
                maxSize: 300,
                runChildUpdate: false
            });
        }

        let effect = scene.projectileGroup.get(x, y, textureKey);
        if (!effect) {
            effect = scene.add.image(x, y, textureKey);
        }

        effect.setTexture(textureKey);
        effect.setActive(true);
        effect.setVisible(true);
        effect.setPosition(x, y);
        effect.setDepth(120);
        effect.setBlendMode(Phaser.BlendModes.ADD);
        effect.setAlpha(1);
        effect.setScale(1);
        // Random rotation for variety
        effect.setRotation(Math.random() * Math.PI * 2);

        scene.tweens.add({
            targets: effect,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            onComplete: () => {
                RenderUtils.destroyProjectile(effect);
            }
        });
    }

    static getProjectileColor(item) {
        if (!item) return 0xffffff;
        // If it has a specific active synergy color override, we could check that too.
        // For now, map element to color.
        const map = {
            fire: 0xff5500,    // Bright Orange
            ice: 0x33ddff,     // Cyan
            thunder: 0xffff00, // Yellow
            leaf: 0x4ade80,    // Green
            gem: 0xd8b4fe,     // Purple
            shadow: 0x7c3aed,  // Dark Purple
            plasma: 0xe879f9,  // Pink
            mystic: 0x6366f1,  // Indigo
        };
        return map[item.element] || 0xffffff;
    }

    static getProjectileTexture(scene, color) {
        // Ensure color is a number string or valid identifier
        const key = `proj_tex_${color}`;
        if (scene.textures.exists(key)) return key;

        // Create texture
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        g.fillStyle(color, 0.4);
        g.fillCircle(10, 10, 10);
        g.fillStyle(color, 0.8);
        g.fillCircle(10, 10, 6);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(10, 10, 3);

        g.generateTexture(key, 20, 20);
        g.destroy();
        
        return key;
    }

    static createProjectile(scene, x, y, target, item) {
        const color = this.getProjectileColor(item);
        const textureKey = this.getProjectileTexture(scene, color);
        
        // Ensure pool exists
        if (!scene.projectileGroup) {
            scene.projectileGroup = scene.add.group({
                classType: Phaser.GameObjects.Image,
                maxSize: 300,
                runChildUpdate: false
            });
        }

        // Get from pool
        let proj = scene.projectileGroup.get(x, y, textureKey);

        if (!proj) {
            // Pool full or creation failed, force create standalone
            proj = scene.add.image(x, y, textureKey);
        }

        // Reset State
        proj.setTexture(textureKey);
        proj.setActive(true);
        proj.setVisible(true);
        proj.setPosition(x, y);
        proj.setScale(1);
        proj.setRotation(0);
        proj.setAlpha(1);
        proj.setDepth(100);
        proj.setBlendMode(Phaser.BlendModes.ADD);

        return proj;
    }

    static destroyProjectile(proj) {
        if (proj) {
            // Return to pool if it belongs to one, otherwise destroy
            if (proj.active) {
                proj.setActive(false);
                proj.setVisible(false);
            } else {
                // If it was already inactive or standalone without pool management (fallback)
                // Just keeping it safe.
            }
        }
    }

    static getArrowTexture(scene, color) {
        const key = `arrow_tex_${color}`;
        if (scene.textures.exists(key)) return key;

        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Draw Arrow (Centered at 0,0 roughly for texture generation)
        // We need positive coordinates for texture generation usually, 
        // or we specify bounds. Let's draw in a 20x40 box.
        // Center x=10, Tip y=40, Back y=20. Trail y=0.
        
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(10, 40);       // Tip
        g.lineTo(7, 20);        // Left back
        g.lineTo(10, 25);       // Shaft center
        g.lineTo(13, 20);       // Right back
        g.closePath();
        g.fillPath();

        // Trail
        g.lineStyle(1, color, 0.5);
        g.lineBetween(10, 20, 10, 0);

        g.generateTexture(key, 20, 40);
        g.destroy();

        return key;
    }

    static createArrowRain(scene, x, y, color = 0x4ade80, onImpact) {
        const count = 5;
        let impactTriggered = false;
        const textureKey = this.getArrowTexture(scene, color);

        if (!scene.projectileGroup) {
            scene.projectileGroup = scene.add.group({
                classType: Phaser.GameObjects.Image,
                maxSize: 300,
                runChildUpdate: false
            });
        }

        for (let i = 0; i < count; i++) {
            let arrow = scene.projectileGroup.get(x, y - 300, textureKey);
            if (!arrow) {
                arrow = scene.add.image(x, y - 300, textureKey);
            }

            // Reset/Init State
            arrow.setTexture(textureKey);
            arrow.setActive(true);
            arrow.setVisible(true);
            arrow.setDepth(150);
            arrow.setBlendMode(Phaser.BlendModes.ADD);
            arrow.setAlpha(1);
            arrow.setScale(1);
            arrow.setRotation(0); // Texture is already vertical

            // Randomize start position slightly above target
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 20;
            const startY = y - 300 - Math.random() * 100;
            
            arrow.x = x + offsetX;
            arrow.y = startY;
            
            // Fall animation
            const duration = 200 + Math.random() * 100;
            scene.tweens.add({
                targets: arrow,
                y: y + offsetY,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    // Trigger damage callback only once per volley
                    if (!impactTriggered && onImpact) {
                        impactTriggered = true;
                        onImpact();
                    }

                    // Impact effect
                    // Optimization: Use a simple pooled circle or just a small tween on the arrow before hiding?
                    // For now, let's just do a quick impact using the arrow itself or a new small graphic.
                    // To save performance, we can skip the complex impact graphic and just flash the arrow or scale it out.
                    // Or reuse the projectile group for impact too?
                    // Let's stick to existing visual but maybe optimized.
                    // Existing used a new graphics for impact. 
                    // Let's try to reuse the arrow object as the impact "flash" by changing its scale/texture?
                    // No, switching texture is fast.
                    
                    // Let's just do the impact effect using a pooled projectile texture (circle) but scaled down/up
                    const impactKey = RenderUtils.getProjectileTexture(scene, color); // Reuse projectile texture
                    let impact = scene.projectileGroup.get(arrow.x, arrow.y, impactKey);
                    if (!impact) impact = scene.add.image(arrow.x, arrow.y, impactKey);
                    
                    impact.setTexture(impactKey);
                    impact.setActive(true);
                    impact.setVisible(true);
                    impact.setDepth(149);
                    impact.setScale(0.5);
                    impact.setAlpha(1);
                    impact.setPosition(arrow.x, arrow.y);

                    scene.tweens.add({
                        targets: impact,
                        scaleX: 2,
                        scaleY: 2,
                        alpha: 0,
                        duration: 150,
                        onComplete: () => {
                             RenderUtils.destroyProjectile(impact);
                        }
                    });
                    
                    RenderUtils.destroyProjectile(arrow);
                }
            });
        }
    }

    static createSpearStrike(scene, x, y, color = 0xffff00) {
        // 1. The Spear (Diagonal Beam)
        const spear = scene.add.graphics();
        spear.setDepth(150);
        spear.setBlendMode(Phaser.BlendModes.ADD);
        
        // Spear angle: slightly diagonal (e.g., -15 degrees from vertical)
        // We will rotate the graphics object itself for easier drawing
        const angleDeg = -15; 
        const rad = Phaser.Math.DegToRad(angleDeg);

        // Draw Spear Shape (Long vertical spike relative to rotation)
        spear.fillStyle(color, 1);
        spear.beginPath();
        spear.moveTo(-2, -600); // Start high up
        spear.lineTo(2, -600);
        spear.lineTo(4, -50);
        spear.lineTo(0, 0);     // Tip at target
        spear.lineTo(-4, -50);
        spear.closePath();
        spear.fillPath();

        // Glow around spear
        spear.lineStyle(10, color, 0.3);
        spear.lineBetween(0, -600, 0, 0);

        spear.x = x;
        spear.y = y;
        spear.rotation = rad; // Apply diagonal rotation

        spear.scaleY = 0; // Start invisible/high
        spear.alpha = 0;

        // Animation Sequence
        // 1. Appear & Slam down
        scene.tweens.add({
            targets: spear,
            scaleY: 1,
            alpha: 1,
            duration: 150,
            ease: 'Back.out',
            onComplete: () => {
                // 2. Impact Shockwave
                const wave = scene.add.graphics();
                wave.setDepth(149);
                wave.x = x;
                wave.y = y;
                // Oval shape for perspective impact
                wave.scaleY = 0.5; 
                
                wave.lineStyle(4, color, 1);
                wave.strokeCircle(0, 0, 10);
                
                scene.tweens.add({
                    targets: wave,
                    scaleX: 3,
                    scaleY: 1.5, // Maintain oval aspect
                    alpha: 0,
                    duration: 300,
                    onComplete: () => wave.destroy()
                });

                // 3. Fade out spear
                scene.tweens.add({
                    targets: spear,
                    scaleY: 2, // Stretch while fading
                    alpha: 0,
                    duration: 200,
                    onComplete: () => spear.destroy()
                });
            }
        });
    }

    static getMineTexture(scene, color) {
        const key = `mine_tex_${color}`;
        if (scene.textures.exists(key)) return key;

        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Mine Body
        g.fillStyle(0x333333, 1);
        g.fillCircle(10, 10, 8);
        g.lineStyle(2, color, 1);
        g.strokeCircle(10, 10, 8);
        
        // Blinking light (static red for texture)
        g.fillStyle(0xff0000, 1);
        g.fillCircle(10, 10, 3);
        
        // Spikes
        g.lineStyle(2, 0x555555, 1);
        g.lineBetween(10, 2, 10, 18);
        g.lineBetween(2, 10, 18, 10);

        g.generateTexture(key, 20, 20);
        g.destroy();
        return key;
    }

    static createMine(scene, x, y, color) {
        const key = this.getMineTexture(scene, color);
        // Use projectile group logic or standalone?
        // Mines are persistent, better to be standalone sprites in traps group.
        
        const mine = scene.add.image(x, y, key);
        mine.setDepth(21); // Slightly above monsters(20)
        
        // Blinking animation
        scene.tweens.add({
            targets: mine,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        return mine;
    }

    static showFloatingText(scene, x, y, text, color = '#ffffff') {
        const txt = scene.add.text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '16px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        });
        txt.setOrigin(0.5);
        txt.setDepth(200);

        scene.tweens.add({
            targets: txt,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => txt.destroy()
        });
    }
}
