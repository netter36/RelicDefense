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
                // Hex Crystal
                const r = sz;
                g.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    g.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
                }
                g.closePath();
                g.fillPath();
                g.strokePath();
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
            // Tech Module
            g.fillStyle(0x3f3f46, 1); // Zinc-700
            g.fillRoundedRect(-w/2 + 6, -h/2 + 6, w - 12, h - 12, 4);
            
            // Circuitry lines
            g.lineStyle(2, 0x52525b, 1);
            g.strokeRect(-w/2 + 10, -h/2 + 10, w - 20, h - 20);
            g.lineBetween(-w/2 + 10, 0, -w/2 + 20, 0);
            g.lineBetween(w/2 - 10, 0, w/2 - 20, 0);

            // Holographic Status
            const buffType = data.buff ? data.buff.type : 'atk';
            const buffColor = buffType === 'atk' ? 0xff4444 : (buffType === 'range' ? 0x44ff44 : 0x4444ff);
            
            g.lineStyle(2, buffColor, 1);
            g.strokeCircle(0, 0, 10);
            
            if (buffType === 'atk') {
                g.lineBetween(-6, -6, 6, 6);
                g.lineBetween(6, -6, -6, 6);
            } else if (buffType === 'range') {
                g.strokeCircle(0, 0, 4);
                g.lineBetween(-8, 0, 8, 0);
                g.lineBetween(0, -8, 0, 8);
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
            
            // Draw Hexagon manually
            g.beginPath();
            for(let i=0; i<6; i++) {
                const angle = i * Math.PI / 3;
                const x = Math.cos(angle) * s;
                const y = Math.sin(angle) * s;
                if(i===0) g.moveTo(x, y);
                else g.lineTo(x, y);
            }
            g.closePath();
            g.fillPath();

            // Armor plates
            g.lineStyle(3, color, 1);
            g.strokePath();

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

        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: 200,
            onComplete: () => g.destroy()
        });
    }

    static createProjectile(scene, x, y, element) {
        const proj = scene.add.graphics();
        proj.x = x;
        proj.y = y;
        // 1. 블럭에 가려지지 않도록 깊이(Depth) 상향 (기존 25 -> 100)
        proj.setDepth(100); 
        proj.setBlendMode(Phaser.BlendModes.ADD);
        scene.physics.add.existing(proj);

        const color = ELEMENT_COLORS[element] || 0xffffff;
        
        // 2. 더 화려한 투사체 이펙트
        // Outer Glow
        proj.fillStyle(color, 0.4);
        proj.fillCircle(0, 0, 10);
        
        // Core Glow
        proj.fillStyle(color, 0.8);
        proj.fillCircle(0, 0, 6);
        
        // Center Hotspot
        proj.fillStyle(0xffffff, 1);
        proj.fillCircle(0, 0, 3);
        
        // Trail effect (simple tween rotation)
        scene.tweens.add({ targets: proj, angle: 360, duration: 200, repeat: -1 });

        // Add particles for trail if possible (simple rects)
        // ... (Skipping complex particles for performance, but glow is enhanced)

        return proj;
    }
}
