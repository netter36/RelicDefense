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
        const el = document.getElementById('difficulty-level');
        if (el) {
            const rate = (interval / 1000).toFixed(1);
            const totalSec = Math.floor((time || 0) / 1000);
            const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
            const s = (totalSec % 60).toString().padStart(2, '0');

            el.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75em; text-align: left; opacity: 0.9; margin-top: 4px;">
                <div style="grid-column: span 2; font-size: 1.2rem; font-weight: bold; color: #ef4444;text-align: center; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 4px;">
                    LV.${difficulty.toFixed(2)}
                </div>
                <div>⏱️ ${m}:${s}</div>
                <div>⚡ ${rate}s</div>
                <div style="grid-column: span 2; text-align: center; color: #f87171; background: rgba(255,0,0,0.1); border-radius: 4px; padding: 2px;">
                    🩸 HP 보너스 x${difficulty.toFixed(2)}
                </div>
            </div>`;
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
                <div class="shop-item-icon" style="background:#2a2a2e; display:flex; justify-content:center; align-items:center;">
                    ${shapeHtml}
                </div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc" style="font-size:0.7em; opacity:0.8; margin-top:4px; display:flex; align-items:start;">
                        <span>${this.getDynamicDesc(item)}</span>
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

        this.tooltip.querySelector('.tooltip-name').innerText = item.name;

        let rarityText = item.element || '기본';
        let rarityColor = '#94a3b8';

        if (isPlaced) {
            if (item.activeSynergy) {
                rarityText = `✨ ${item.activeSynergy}`;
                rarityColor = '#f59e0b';
            } else if (item.isSynergetic) {
                rarityText = '시너지 활성';
                rarityColor = '#f59e0b';
            }
        }

        const rarityEl = this.tooltip.querySelector('.tooltip-rarity');
        rarityEl.innerText = rarityText;
        rarityEl.style.color = rarityColor;
        this.tooltip.querySelector('.tooltip-desc').innerHTML = this.getDynamicDesc(item);

        this.updateTooltipPos(e);
    }

    updateTooltipPos(e) {
        if (!this.tooltip) return;
        const x = e.pageX || (e.event ? e.event.pageX : 0);
        const y = e.pageY || (e.event ? e.event.pageY : 0);
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y + 15) + 'px';
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
            return `<div style="font-size:0.95em; line-height:1.4;">
                <div style="color:${color}; font-weight:bold; margin-bottom:6px;">${buffText}</div>
                <div style="font-size:0.9em; color:#ccc; padding-top:4px; border-top:1px solid #ffffff20;">${item.baseDesc || item.desc || ""}</div>
            </div>`;
        }

        const stats = item.stats || {};
        let atk = item.currentAtk || stats.atk || 0;
        let range = item.range || stats.range || COMBAT_CONFIG.DEFAULT_RANGE;
        let fr = item.currentFireRate || stats.fireRate || COMBAT_CONFIG.DEFAULT_FIRE_RATE;

        // DPS Calculation
        const dps = Math.round(atk * (1000 / (fr || 1000)));

        const synColors = {
            fire: '#ff5555',
            ice: '#33ddff',
            thunder: '#ffeb3b',
            leaf: '#4caf50',
            gem: '#e040fb'
        };

        let html = `<div style="font-size:0.95em; line-height:1.5;">`;
        html += `<div>⚡ 초당 공격력: <span style="color:#fbbf24; font-weight:bold;">${Math.round(dps)}</span></div>`;
        html += `<div>🎯 사거리: <span style="color:#38bdf8; font-weight:bold;">${Math.round(range)}</span></div>`;

        // Special Stats
        if (stats.attackType === 'rapid') {
            const reload = (stats.reloadTime || 0) / 1000;
            html += `<div>🔄 장전: <span style="color:#cbd5e1;">${reload.toFixed(1)}s</span> <span style="font-size:0.9em; color:#94a3b8;">(${stats.burstCount}연사)</span></div>`;
        }
        if (stats.attackType === 'chain') {
            html += `<div>🔗 연쇄: <span style="color:#a78bfa; font-weight:bold;">${stats.chainCount}명</span></div>`;
        }
        if (stats.attackType === 'multi') {
            html += `<div>✨ 동시: <span style="color:#f472b6; font-weight:bold;">${stats.projectileCount}발</span></div>`;
        }
        if (stats.aoeRadius) {
            html += `<div>💥 범위: <span style="color:#f87171; font-weight:bold;">${Math.round(stats.aoeRadius)}px</span></div>`;
        }

        // Active Synergy
        if (item.activeSynergy) {
            const sColor = synColors[item.element] || '#ffffff';
            html += `<div style="color:${sColor}; font-weight:bold; margin-top:4px;">✨ ${item.activeSynergy} 발동!</div>`;
        }

        // Description
        const desc = item.baseDesc || item.desc || "";
        if (desc) {
            html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #ffffff20; color:#ccc; font-size:0.9em;">${desc}</div>`;
        }

        // Flavor Text
        if (item.flavor) {
            html += `<div style="margin-top:4px; color:#94a3b8; font-size:0.8em; font-style:italic;">${item.flavor}</div>`;
        }

        html += `</div>`;
        return html;
    }
}
