import { ITEMS } from '../data/items.js';
import { ELEMENT_COLORS, SYNERGIES, COMBAT_CONFIG } from '../constants.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;

        this.shopTags = document.getElementById('shop-tags');
        this.shopList = document.getElementById('item-shop');
        this.tooltip = document.getElementById('tooltip');
        this.activeTag = '전체';
        this.searchQuery = '';
    }

    updateHUD(state) {
        const atkEl = document.getElementById('stat-atk');
        const fireEl = document.getElementById('stat-fire-bonus');
        const artEl = document.getElementById('stat-artifacts');

        if (atkEl) atkEl.innerText = state.atk;
        if (fireEl) fireEl.innerText = state.fireBonus + '%';
        if (artEl) artEl.innerText = state.artifacts;

        const comboList = document.getElementById('combo-list');
        if (!comboList) return;

        if (state.combos.length === 0) {
            comboList.innerHTML = '<div class="no-effects">활성화된 시너지 없음</div>';
        } else {
            comboList.innerHTML = state.combos.map(name => {
                const syn = SYNERGIES.find(s => s.name === name);
                const desc = syn ? syn.desc : '';
                return `
                <div class="combo-item">
                    <div class="combo-name">✨ ${name}</div>
                    <div class="combo-desc">${desc}</div>
                </div>`;
            }).join('');
        }
    }

    updateMonsterCount(count) {
        const el = document.getElementById('monster-count');
        if (el) el.innerText = count;
    }

    updateDifficultyInfo(difficulty, interval, time) {
        // Updated for new card layout
        const lvlEl = document.getElementById('difficulty-level-value');
        const detailsEl = document.getElementById('difficulty-details');

        if (lvlEl && detailsEl) {
            const rate = (interval / 1000).toFixed(1);
            const totalSec = Math.floor((time || 0) / 1000);
            const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
            const s = (totalSec % 60).toString().padStart(2, '0');

            lvlEl.innerText = `LV.${difficulty.toFixed(2)}`;

            detailsEl.innerHTML = `
                <div class="diff-row">
                    <span>⏱️ 진행 시간</span>
                    <span style="color:#e2e8f0; font-family: var(--pixel-font);">${m}:${s}</span>
                </div>
                <div class="diff-row">
                    <span>⚡ 스폰 주기</span>
                    <span style="color:#fbbf24; font-family: var(--pixel-font);">${rate}s</span>
                </div>
                <div class="diff-bonus">
                    🩸 몬스터 체력 x${difficulty.toFixed(2)}
                </div>
            `;
        }
    }

    initSpeedControls() {
        const speeds = [1, 2, 4];
        speeds.forEach(s => {
            const btn = document.getElementById(`btn-speed-${s}`);
            if (btn) {
                btn.onclick = () => {
                    this.scene.setSpeed(s);
                    speeds.forEach(os => {
                        const ob = document.getElementById(`btn-speed-${os}`);
                        if (ob) {
                            ob.style.background = '#333';
                            ob.style.color = '#aaa';
                            ob.style.border = '1px solid #444';
                        }
                    });
                    btn.style.background = '#6366f1';
                    btn.style.color = 'white';
                    btn.style.border = 'none';
                };
            }
        });
    }

    initShop() {
        this.initSpeedControls();
        ITEMS.forEach(item => {
            if (!item.baseDesc) {
                item.baseDesc = item.desc.replace(/^\[.*?\]\s*/, '');
            }
        });

        this.renderTags();
        this.renderItems();
    }

    renderTags() {
        if (!this.shopTags) return;
        const tags = ['전체', '화염', '냉기', '전격', '대지', '심연', '석판', '아티팩트']; // Basic tags for now
        this.shopTags.innerHTML = '';
        tags.forEach(tag => {
            const btn = document.createElement('button');
            btn.innerText = tag;
            btn.className = 'tag-pill' + (this.activeTag === tag ? ' active' : '');
            btn.onclick = () => {
                this.activeTag = tag;
                this.renderTags();
                this.renderItems();
            };
            this.shopTags.appendChild(btn);
        });
    }

    renderItems() {
        if (!this.shopList) return;
        this.shopList.innerHTML = '';

        const TAG_MAP = {
            'fire': '화염', 'ice': '냉기', 'thunder': '전격', 'leaf': '대지', 'gem': '심연', 'tablet': '석판', 'artifact': '아티팩트'
        };

        const ATTACK_TYPE_MAP = {
            normal: '일반',
            rapid: '연사',
            laser: '레이저',
            nova: '파동',
            bomb: '폭발',
            chain: '연쇄',
            multi: '다중',
            tablet: '버프'
        };

        ITEMS.filter(item => {
            return this.activeTag === '전체' || [TAG_MAP[item.element], TAG_MAP[item.type]].filter(Boolean).includes(this.activeTag);
        }).forEach(item => {
            const div = document.createElement('div');
            div.className = 'shop-item';

            // Generate shape preview
            let shapeHtml = '<div style="display:grid; gap:2px; justify-content:center; align-items:center;">';
            item.shape.forEach(row => {
                shapeHtml += '<div style="display:flex; gap:2px;">';
                row.forEach(cell => {
                    const colorVal = ELEMENT_COLORS[item.element] || 0x64748b;
                    const colorHex = '#' + colorVal.toString(16).padStart(6, '0');
                    const bg = cell ? colorHex : 'transparent';
                    shapeHtml += `<div style="width:8px; height:8px; background:${bg}; border-radius:1px;"></div>`;
                });
                shapeHtml += '</div>';
            });
            shapeHtml += '</div>';

            div.innerHTML = `
                <div class="shop-item-icon">
                    ${shapeHtml}
                </div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-meta">
                        <span class="shop-item-type">${TAG_MAP[item.element] || '기본'}</span>
                        <span class="shop-item-attack-type">${ATTACK_TYPE_MAP[item.stats?.attackType || item.type] || '특수형'}</span>
                    </div>
                </div>
            `;

            div.onmousemove = (e) => this.showTooltip(e, item);
            div.onmouseleave = () => this.hideTooltip();
            div.onclick = () => {
                // Auto-placement logic
                const template = ITEMS.find(i => i.id === item.id);
                // We need to check size from template to find slot
                // We can just use the item object here since it matches structure roughly (or pass id)

                // Need access to GridSystem's findEmptySlot. 
                // GridSystem is attached to Scene.
                if (this.scene.gridSystem) {
                    const pos = this.scene.gridSystem.findEmptySlot(item);
                    if (pos) {
                        this.scene.gridSystem.createItem(item.id, pos.x, pos.y);
                    } else {
                        // Feedback for full grid?
                        console.log('Grid is full!');
                        const originalColor = div.style.backgroundColor;
                        div.style.backgroundColor = '#ef4444';
                        setTimeout(() => div.style.backgroundColor = '', 200);
                    }
                }
            };
            this.shopList.appendChild(div);
        });
    }

    showTooltip(e, item, isPlaced = false) {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('hidden');
        this.tooltip.style.display = 'block';

        // Rebuild Tooltip HTML structure if it doesn't match new design
        // We will just overwrite innerHTML for simplicity to ensure structure
        let rarityText = item.element ? ELEMENT_COLORS[item.element] ? item.element.toUpperCase() : item.element : 'BASIC';
        let rarityColor = '#94a3b8';

        // Translate Element
        const TAG_MAP = {
            'fire': '불 (FIRE)', 'ice': '얼음 (ICE)', 'thunder': '번개 (THUNDER)',
            'leaf': '풀 (LEAF)', 'gem': '보석 (VOID)', 'tablet': '석판', 'artifact': '전술유물'
        };
        rarityText = TAG_MAP[item.element] || rarityText;

        if (isPlaced) {
            if (item.activeSynergy) {
                rarityText = `✨ ${item.activeSynergy}`;
                rarityColor = '#f59e0b';
            } else if (item.isSynergetic) {
                rarityText = '✨ 시너지 활성';
                rarityColor = '#f59e0b';
            }
        }

        const dynamicContent = this.getDynamicDesc(item);

        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-name">${item.name}</div>
                <div class="tooltip-rarity" style="color:${rarityColor}">${rarityText}</div>
            </div>
            <div class="tooltip-content">
                <div class="tooltip-desc">${dynamicContent}</div>
            </div>
        `;

        this.updateTooltipPos(e);
    }



    updateTooltipPos(e) {
        if (!this.tooltip) return;

        const x = e.pageX || (e.event ? e.event.pageX : 0);
        const y = e.pageY || (e.event ? e.event.pageY : 0);

        // Postion tooltip nicely
        const tooltipHeight = this.tooltip.offsetHeight || 150; // Estimate if not rendered yet
        const offset = 20;

        this.tooltip.style.left = (x + 15) + 'px';

        // Default to showing above the mouse to avoid blocking view of list items at bottom
        let topPos = y - tooltipHeight - offset;

        // If it goes off the top of the screen, show it below
        if (topPos < 10) {
            topPos = y + offset;
        }

        this.tooltip.style.top = topPos + 'px';
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.add('hidden');
            this.tooltip.style.display = 'none';
        }
    }

    getDynamicDesc(item) {
        if (item.type === 'tablet') {
            const buffText = item.buff ? `🛡️ 인접 공격력 +${item.buff.val}%` : `[기초 시설]`;
            const color = item.buff ? '#4ade80' : '#94a3b8';
            return `
                <div style="color:${color}; font-weight:bold; margin-bottom:8px; font-size: 0.95rem;">${buffText}</div>
                <div style="font-size:0.85rem; color:#94a3b8; line-height:1.4;">${item.baseDesc || item.desc || ""}</div>
            `;
        }

        const stats = item.stats || {};
        let atk = item.currentAtk || stats.atk || 0;
        let range = item.range || stats.range || COMBAT_CONFIG.DEFAULT_RANGE;
        let fr = item.currentFireRate || stats.fireRate || COMBAT_CONFIG.DEFAULT_FIRE_RATE;

        // DPS Calculation
        const dps = Math.round(atk * (1000 / (fr || 1000)));

        let html = `
            <div class="tt-stats">
                <div class="tt-stat">
                    <span class="tt-stat-label">DPS (초당 피해)</span>
                    <span class="tt-stat-val" style="color:#fbbf24">${Math.round(dps)}</span>
                </div>
                <div class="tt-stat">
                    <span class="tt-stat-label">사거리 (Range)</span>
                    <span class="tt-stat-val" style="color:#38bdf8">${Math.round(range)}</span>
                </div>
            </div>
        `;

        let extraStats = [];

        // Special Stats
        if (stats.attackType === 'rapid') {
            const reload = (stats.reloadTime || 0) / 1000;
            extraStats.push(`<div>🔄 장전: <span style="color:#fff;">${reload.toFixed(1)}s</span> <span style="opacity:0.7">(${stats.burstCount}연사)</span></div>`);
        }
        if (stats.attackType === 'chain') {
            extraStats.push(`<div>🔗 연쇄 공격: <span style="color:#a78bfa;">${stats.chainCount}명</span></div>`);
        }
        if (stats.attackType === 'multi') {
            extraStats.push(`<div>✨ 동시 발사: <span style="color:#f472b6;">${stats.projectileCount}발</span></div>`);
        }
        if (stats.aoeRadius) {
            extraStats.push(`<div>💥 폭발 범위: <span style="color:#f87171;">${Math.round(stats.aoeRadius)}px</span></div>`);
        }

        if (extraStats.length > 0) {
            html += `<div style="font-size:0.85em; display:flex; flex-direction:column; gap:4px; margin-bottom:8px;">${extraStats.join('')}</div>`;
        }

        // Active Synergy
        if (item.activeSynergy) {
            const synColors = {
                fire: '#ff5555',
                ice: '#33ddff',
                thunder: '#ffeb3b',
                leaf: '#4caf50',
                gem: '#e040fb'
            };
            const sColor = synColors[item.element] || '#ffffff';
            html += `<div class="tt-divider"></div>`;
            html += `<div style="color:${sColor}; font-weight:bold; margin-bottom:4px; font-size:0.9rem;">✨ ${item.activeSynergy} 발동!</div>`;
        }

        // Description
        const desc = item.baseDesc || item.desc || "";
        if (desc) {
            html += `<div class="tt-divider"></div>`;
            html += `<div style="color:#ccc; font-size:0.85em; font-style: italic;">${desc}</div>`;
        }

        // Flavor Text
        if (item.flavor) {
            html += `<div style="margin-top:8px; color:#64748b; font-size:0.8em;">${item.flavor}</div>`;
        }

        return html;
    }
}
