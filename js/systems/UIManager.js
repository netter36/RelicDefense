import { ITEMS } from '../items.js';
import { ELEMENT_COLORS, SYNERGIES } from '../constants.js';

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

    initShop() {
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
                        <span>${this.scene.getDynamicDesc(item)}</span>
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
        this.tooltip.querySelector('.tooltip-desc').innerHTML = this.scene.getDynamicDesc(item);

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
}
