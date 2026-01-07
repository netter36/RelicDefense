import { SYNERGIES } from '../constants.js';

export class SynergySystem {
    constructor() {}

    calculateSynergies(placedItems, slotSize) {
        const activeCombos = [];

        // 1. Reset Stats
        placedItems.forEach(i => {
            i.isSynergetic = false;
            i.activeSynergy = null;
            i.currentAtk = i.stats?.atk || 0;
            i.currentFireRate = i.stats?.fireRate || 1000;
            i.range = i.stats?.range || 250;
            i.critChance = 0;
            i.debuffEfficiency = 1;
            i.aoeMult = 1; 
            i.pierceCount = 0;
            i.executeThreshold = 0;
            i.debuffDurationMult = 1;
        });

        // 2. Apply Tablet Buffs
        this._applyTabletBuffs(placedItems, slotSize);

        // 3. Apply Synergies (Element & Role)
        const combos = this._applyGroupSynergies(placedItems, slotSize);
        activeCombos.push(...combos);

        return { activeCombos };
    }

    _applyTabletBuffs(placedItems, slotSize) {
        placedItems.forEach(tablet => {
            if (tablet.type === 'tablet' && tablet.buff) {
                placedItems.forEach(target => {
                    if (target !== tablet && target.type === 'artifact' && this._areAdjacent(tablet, target, slotSize)) {
                        const val = tablet.buff.val / 100;
                        switch(tablet.buff.type) {
                            case 'atk': target.currentAtk *= (1 + val); break;
                            case 'range': target.range *= (1 + val); break;
                            case 'focus': 
                                target.currentAtk *= (1 + val); 
                                target.range *= (1 - tablet.buff.penalty / 100); 
                                break;
                            case 'speed': target.currentFireRate *= (1 - val); break;
                            case 'crit': target.critChance += val; break;
                            case 'area': target.aoeMult = (target.aoeMult || 1) * (1 + val); break;
                        }
                    }
                });
            }
        });
    }

    _applyGroupSynergies(placedItems, slotSize) {
        const activeCombos = [];
        
        SYNERGIES.forEach(syn => {
            const visitedForThisSynergy = new Set();

            placedItems.forEach(startItem => {
                if (startItem.type !== 'artifact') return; 
                if (visitedForThisSynergy.has(startItem)) return;

                // Check Property
                let hasProp = false;
                if (syn.type === 'element' && startItem.element === syn.key) hasProp = true;
                if (syn.type === 'role' && startItem.role === syn.key) hasProp = true;

                if (!hasProp) return;

                // BFS
                const group = this._findGroup(startItem, syn, placedItems, visitedForThisSynergy, slotSize);

                // Apply Effects
                if (group.length >= syn.req) {
                    if (!activeCombos.includes(syn.name)) activeCombos.push(syn.name);
                    this._applySynergyEffect(group, syn);
                }
            });
        });
        return activeCombos;
    }

    _findGroup(startItem, syn, placedItems, visitedSet, slotSize) {
        const group = [];
        const queue = [startItem];
        visitedSet.add(startItem);

        while (queue.length > 0) {
            const current = queue.shift();
            group.push(current);

            placedItems.forEach(neighbor => {
                if (neighbor.type !== 'artifact') return;
                if (!visitedSet.has(neighbor) && this._areAdjacent(current, neighbor, slotSize)) {
                    let neighborHasProp = false;
                    if (syn.type === 'element' && neighbor.element === syn.key) neighborHasProp = true;
                    if (syn.type === 'role' && neighbor.role === syn.key) neighborHasProp = true;

                    if (neighborHasProp) {
                        visitedSet.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            });
        }
        return group;
    }

    _applySynergyEffect(group, syn) {
        group.forEach(i => {
            i.isSynergetic = true;
            if (!i.activeSynergy || syn.type === 'element') {
                i.activeSynergy = syn.name;
            }

            // Apply Stats
            if (syn.id === 'fire_power') i.currentAtk *= 1.2;
            if (syn.id === 'ice_freeze') i.debuffEfficiency *= 1.25;
            if (syn.id === 'thunder_rapid') i.currentFireRate *= 0.7;
            if (syn.id === 'leaf_regen') i.range *= 1.15;
            if (syn.id === 'gem_legend') i.critChance += 0.1;
            if (syn.id === 'shadow_curse') i.executeThreshold = 0.3;
            if (syn.id === 'plasma_boom') i.aoeMult = (i.aoeMult || 1) * 1.5;
            if (syn.id === 'mystic_pierce') i.pierceCount = (i.pierceCount || 0) + 1;

            if (syn.id === 'role_sniper') { i.range += 100; i.critChance += 0.1; }
            if (syn.id === 'role_artillery') i.aoeMult = (i.aoeMult || 1) * 1.3;
            if (syn.id === 'role_assault') i.currentFireRate *= 0.8;
            if (syn.id === 'role_support') i.debuffDurationMult = 1.5;
        });
    }

    _areAdjacent(itemA, itemB, slotSize) {
        if (!itemA || !itemB) return false;
        
        const a = itemA.gridPos;
        const b = itemB.gridPos;
        if (!a || !b) return false;

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
