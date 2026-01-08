import { ITEMS } from '../data/items.js';
import { ELEMENT_COLORS, SYNERGIES, COMBAT_CONFIG, GAME_CONFIG } from '../constants.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;

        this.shopTags = document.getElementById('shop-tags');
        this.shopList = document.getElementById('item-shop');
        this.shopTabs = document.getElementById('shop-tabs');
        this.tooltip = document.getElementById('tooltip');
        this.activeTag = '전체';
        this.activeTab = 'artifact'; // 기본 탭: 아티팩트
        this.searchQuery = '';
    }

    updateHUD(state) {
        const comboList = document.getElementById('combo-list');
        const dpsEl = document.getElementById('stat-dps');

        if (dpsEl && state.dps !== undefined) {
            dpsEl.innerText = state.dps.toLocaleString(); // 1,000 단위 콤마
        }

        if (!comboList) return;

        if (state.combos.length === 0) {
            comboList.innerHTML = '<div class="no-effects">활성화된 시너지 없음</div>';
        } else {
            comboList.innerHTML = state.combos.map(name => {
                const syn = SYNERGIES.find(s => s.name === name);
                const desc = syn ? syn.desc : '';
                const colorMap = {
                    'fire': '#ef4444',
                    'ice': '#3b82f6',
                    'thunder': '#facc15',
                    'leaf': '#10b981',
                    'gem': '#d8b4fe'
                };
                const color = syn ? (colorMap[syn.element] || '#8b5cf6') : '#8b5cf6';

                return `
                <div class="combo-item" style="border-left-color: ${color}; background: linear-gradient(90deg, ${color}22, transparent);">
                    <div class="combo-name" style="color: ${color};">✨ ${name}</div>
                    <div class="combo-desc">${desc}</div>
                </div>`;
            }).join('');
        }
    }

    updateGold(amount) {
        const el = document.getElementById('stat-gold');
        if (el) el.innerText = amount;

        // 상점 아이템 상태 업데이트
        if (this.shopList) {
            const items = this.shopList.querySelectorAll('.shop-item');
            items.forEach(item => {
                const cost = parseInt(item.dataset.cost);
                const priceEl = item.querySelector('.shop-item-cost');
                
                if (amount >= cost) {
                    item.classList.remove('disabled');
                    item.style.opacity = '1';
                    if (priceEl) priceEl.style.color = '#ffd700';
                } else {
                    item.classList.add('disabled');
                    item.style.opacity = '0.5';
                    if (priceEl) priceEl.style.color = '#ff4444';
                }
            });
        }
    }

    updateMonsterCount(count) {
        const el = document.getElementById('monster-count');
        if (el) {
            const max = GAME_CONFIG.MAX_MONSTERS || 150;
            el.innerText = `${count} / ${max}`;
            
            // 위험도 표시 (80% 이상일 때 빨간색 경고)
            if (count >= max * 0.8) {
                el.style.color = '#ff4444';
            } else {
                el.style.color = '#ffffff';
            }
        }
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
        const speeds = [0, 1, 2, 4];
        speeds.forEach(s => {
            const btn = document.getElementById(`btn-speed-${s}`);
            if (btn) {
                btn.onclick = () => {
                    this.scene.setSpeed(s);
                    speeds.forEach(os => {
                        const ob = document.getElementById(`btn-speed-${os}`);
                        if (ob) {
                            ob.classList.remove('active');
                            ob.style.background = '#333';
                            ob.style.color = '#aaa';
                            ob.style.border = '1px solid #444';
                        }
                    });
                    btn.classList.add('active');
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

        this.renderShopTabs(); // 탭 렌더링
        this.renderTags();
        this.renderItems();
    }

    renderShopTabs() {
        if (!this.shopTabs) return;

        // 탭 버튼에 이벤트 리스너 추가 (HTML에 이미 버튼이 있다고 가정하거나 동적 생성 가능)
        // 여기서는 HTML에 추가한 버튼을 사용
        const btns = this.shopTabs.querySelectorAll('.shop-tab-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                const tab = btn.dataset.tab;
                if (this.activeTab !== tab) {
                    this.activeTab = tab;
                    this.activeTag = '전체'; // 탭 전환 시 태그 초기화
                    
                    // Update Active Class
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    this.renderTags();
                    this.renderItems();
                }
            };
        });
    }

    renderTags() {
        if (!this.shopTags) return;
        
        let tags = [];
        if (this.activeTab === 'artifact') {
            tags = ['전체', '화염', '냉기', '전격', '대지', '심연', '플라즈마', '신비', '그림자'];
        } else {
            // Module (Tablet) Tags
            tags = ['전체', '공격', '범위', '특수']; 
        }

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
            'fire': '화염', 'ice': '냉기', 'thunder': '전격', 'leaf': '대지', 'gem': '심연', 
            'plasma': '플라즈마', 'mystic': '신비', 'shadow': '그림자',
            'tablet': '모듈', 'artifact': '아티팩트', 'normal': '노말'
        };

        const ATTACK_TYPE_MAP = {
            normal: '일반',
            rapid: '연사',
            laser: '레이저',
            nova: '파동',
            bomb: '폭발',
            chain: '연쇄',
            multi: '다중',
            orbit: '위성',
            beam: '방사',
            ricochet: '도탄',
            trap: '지뢰',
            random_bomb: '폭격',
            tablet: '버프'
        };

        const ROLE_MAP = {
            sniper: '저격',
            artillery: '포격',
            assault: '돌격',
            support: '지원'
        };

        const filteredItems = this._filterItems(TAG_MAP);

        filteredItems.forEach(item => {
            const el = this._createShopItemElement(item, TAG_MAP, ROLE_MAP, ATTACK_TYPE_MAP);
            this.shopList.appendChild(el);
        });
    }

    _filterItems(TAG_MAP) {
        return ITEMS.filter(item => {
            if (this.activeTab === 'artifact' && item.type !== 'artifact') return false;
            if (this.activeTab === 'module' && item.type !== 'tablet') return false;
            if (this.activeTag === '전체') return true;

            const elTag = TAG_MAP[item.element];
            const typeTag = TAG_MAP[item.type];
            let buffTag = null;
            if (item.type === 'tablet' && item.buff) {
                if (item.buff.type === 'atk') buffTag = '공격';
                if (item.buff.type === 'range') buffTag = '범위';
            }

            return [elTag, typeTag, buffTag].filter(Boolean).includes(this.activeTag);
        });
    }

    _createShopItemElement(item, TAG_MAP, ROLE_MAP, ATTACK_TYPE_MAP) {
        const cost = item.type === 'tablet' ? GAME_CONFIG.COSTS.TABLET : GAME_CONFIG.COSTS.ARTIFACT;
        // 초기 렌더링 시에도 현재 골드 기반으로 상태 설정
        const canAfford = this.scene.gold >= cost;

        const div = document.createElement('div');
        div.className = `shop-item ${canAfford ? '' : 'disabled'}`;
        div.dataset.cost = cost; // 골드 업데이트 시 참조용
        if (!canAfford) div.style.opacity = '0.5';

        const tagsHtml = this._generateTagsHtml(item, TAG_MAP, ROLE_MAP, ATTACK_TYPE_MAP);

        div.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-meta">
                    ${tagsHtml}
                    <span class="shop-item-cost" style="color: ${canAfford ? '#ffd700' : '#ff4444'}">💰 ${cost}</span>
                </div>
            </div>
        `;

        div.onmousemove = (e) => this.showTooltip(e, item);
        div.onmouseleave = () => this.hideTooltip();
        div.onclick = () => {
            // 클릭 시점의 골드 확인 (중요)
            if (this.scene.gold < cost) return;
            
            // Auto-placement logic
            if (this.scene.gridSystem) {
                const placed = this.scene.gridSystem.autoPlaceItem(item.id);
                if (placed) {
                    this.scene.spendGold(cost);
                } else {
                    // 배치 실패 피드백 (화면 흔들림 또는 경고)
                    const gameContainer = document.querySelector('.game-container');
                    gameContainer.style.animation = 'none';
                    gameContainer.offsetHeight; /* trigger reflow */
                    gameContainer.style.animation = 'shake 0.3s';
                    
                    // 또는 상점 아이템 자체에 피드백
                    div.style.transform = 'translateX(5px)';
                    setTimeout(() => div.style.transform = 'none', 100);
                }
            }
        };
        return div;
    }

    _generateTagsHtml(item, TAG_MAP, ROLE_MAP, ATTACK_TYPE_MAP) {
        let tagsHtml = '';
        if (item.element && TAG_MAP[item.element]) {
            tagsHtml += `<span class="shop-item-type" style="color:${this.getElementColor(item.element)}">${TAG_MAP[item.element]}</span>`;
        }
        if (item.role && ROLE_MAP[item.role]) {
            tagsHtml += `<span class="shop-item-type">${ROLE_MAP[item.role]}</span>`;
        }
        if (item.stats && item.stats.attackType && ATTACK_TYPE_MAP[item.stats.attackType]) {
            tagsHtml += `<span class="shop-item-attack-type">${ATTACK_TYPE_MAP[item.stats.attackType]}</span>`;
        }
        if (item.type === 'tablet') {
            tagsHtml += `<span class="shop-item-type">모듈</span>`;
        }
        return tagsHtml;
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
            <div class="tooltip-header" style="--rarity-color: ${rarityColor};">
                <div class="tooltip-name">${item.name}</div>
            </div>
            <div class="tooltip-body">
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
        // --- 1. 모듈 (Tablet) 처리 ---
        if (item.type === 'tablet') {
            let buffText = '';
            let color = '#94a3b8';
            
            if (item.buff) {
                if (item.buff.type === 'atk') {
                    buffText = `⚔️ 인접 공격력 +${item.buff.val}%`;
                    color = '#f87171'; // Red
                } else if (item.buff.type === 'range') {
                    buffText = `🎯 인접 사거리 +${item.buff.val}%`;
                    color = '#38bdf8'; // Blue
                } else if (item.buff.type === 'focus') {
                    buffText = `🔥 공격력 +${item.buff.val}% / 📉 사거리 -${item.buff.penalty}%`;
                    color = '#fbbf24'; // Amber
                } else if (item.buff.type === 'speed') {
                    buffText = `⚡ 공격 속도 +${item.buff.val}%`;
                    color = '#facc15'; // Yellow
                } else if (item.buff.type === 'crit') {
                    buffText = `🎯 치명타 확률 +${item.buff.val}%`;
                    color = '#e879f9'; // Pink
                } else if (item.buff.type === 'area') {
                    buffText = `💥 폭발 범위 +${item.buff.val}%`;
                    color = '#f87171'; // Red
                }
            } else {
                buffText = `[기초 시설]`;
            }

            return `
                <div style="color:${color}; font-weight:bold; margin-bottom:12px; font-size: 0.95rem;">${buffText}</div>
                <div style="font-size:0.9rem; color:#ccc; line-height:1.5;">${item.baseDesc || item.desc || ""}</div>
            `;
        }

        // --- 2. 아티팩트 (Artifact) 처리 ---
        const stats = item.stats || {};
        let atk = item.currentAtk || stats.atk || 0;
        let range = item.range || stats.range || COMBAT_CONFIG.DEFAULT_RANGE;
        let fr = item.currentFireRate || stats.fireRate || COMBAT_CONFIG.DEFAULT_FIRE_RATE;

        // DPS Calculation (소수점 1자리까지 표시)
        const dps = (atk * (1000 / (fr || 1000))).toFixed(1);

        // 새로운 툴팁 스타일 적용 (Grid Layout)
        let html = `
            <div class="tooltip-stats">
                <div class="stat-row">
                    <span>공격력</span>
                    <span>${Math.round(atk)}</span>
                </div>
                <div class="stat-row">
                    <span>공격 속도</span>
                    <span>${(1000 / fr).toFixed(2)}/s</span>
                </div>
                <div class="stat-row">
                    <span>DPS</span>
                    <span style="color:#fbbf24">${dps}</span>
                </div>
                <div class="stat-row">
                    <span>사거리</span>
                    <span style="color:#38bdf8">${Math.round(range)}</span>
                </div>
            </div>
        `;

        // 추가 스탯 (특수 능력)
        let extraStats = [];
        if (stats.attackType === 'rapid') {
            const reload = (stats.reloadTime || 0) / 1000;
            extraStats.push(`<div class="stat-row"><span>장전 속도</span><span>${reload.toFixed(1)}초</span></div>`);
            extraStats.push(`<div class="stat-row"><span>연사 횟수</span><span>${stats.burstCount}발</span></div>`);
        }
        if (stats.attackType === 'chain') {
            extraStats.push(`<div class="stat-row"><span style="color:#a78bfa">연쇄 타격</span><span>${stats.chainCount}명</span></div>`);
        }
        if (stats.attackType === 'multi') {
            extraStats.push(`<div class="stat-row"><span style="color:#f472b6">동시 발사</span><span>${stats.projectileCount}발</span></div>`);
        }
        if (stats.aoeRadius || stats.attackType === 'nova' || stats.attackType === 'bomb') {
            const rad = stats.aoeRadius || (stats.attackType === 'nova' ? COMBAT_CONFIG.NOVA_RADIUS : COMBAT_CONFIG.BOMB_RADIUS);
            extraStats.push(`<div class="stat-row"><span style="color:#f87171">폭발 범위</span><span>${Math.round(rad)}px</span></div>`);
        }
        if (stats.debuff) {
             const typeMap = { 'slow': '둔화', 'stun': '기절', 'poison': '중독', 'vulnerable': '약화' };
             const valStr = stats.debuff.val ? `${stats.debuff.val}` : '';
             const durStr = (stats.debuff.duration / 1000).toFixed(1) + 's';
             extraStats.push(`<div class="stat-row"><span style="color:#4ade80">${typeMap[stats.debuff.type]}</span><span>${valStr} (${durStr})</span></div>`);
        }

        if (extraStats.length > 0) {
            html += `<div class="tooltip-stats" style="margin-top:8px; border-top:1px solid #333; padding-top:8px;">${extraStats.join('')}</div>`;
        }

        // Active Synergy
        if (item.activeSynergy) {
            const synColors = {
                fire: '#ff5555', ice: '#33ddff', thunder: '#ffeb3b', leaf: '#4caf50', 
                gem: '#e040fb', shadow: '#7c3aed', plasma: '#e879f9', mystic: '#6366f1'
            };
            const sColor = synColors[item.element] || '#ffffff';
            html += `<div style="margin-top:12px; color:${sColor}; font-weight:bold; font-size:0.9rem; text-shadow:0 0 5px ${sColor}44;">✨ ${item.activeSynergy} 활성화</div>`;
        }

        // Description & Flavor
        const desc = item.baseDesc || item.desc || "";
        if (desc) {
            html += `<div class="tooltip-desc" style="margin-top:12px;">${desc}</div>`;
        }
        if (item.flavor) {
            html += `<div class="tooltip-flavor">${item.flavor}</div>`;
        }

        return html;
    }

    getElementColor(element) {
        const color = ELEMENT_COLORS[element] || 0xffffff;
        return '#' + color.toString(16).padStart(6, '0');
    }
}
