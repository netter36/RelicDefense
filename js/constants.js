export const GRID_WIDTH = 7;
export const GRID_HEIGHT = 7;
export const SLOT_SIZE = 70;
export const CANVAS_WIDTH = 650;
export const CANVAS_HEIGHT = 650;

export const SYNERGIES = [
    // --- Elemental Synergies ---
    { id: 'fire_power', name: '화염의 시너지', type: 'element', key: 'fire', req: 2, desc: '공격력 +20%' },
    { id: 'ice_freeze', name: '혹한의 시너지', type: 'element', key: 'ice', req: 2, desc: '둔화 효율 +25%' },
    { id: 'thunder_rapid', name: '전격의 시너지', type: 'element', key: 'thunder', req: 2, desc: '연사 속도 +30%' },
    { id: 'leaf_regen', name: '생명의 시너지', type: 'element', key: 'leaf', req: 2, desc: '사거리 +15%' },
    { id: 'gem_legend', name: '보석의 시너지', type: 'element', key: 'gem', req: 2, desc: '치명타 확률 +10%' },
    { id: 'shadow_curse', name: '그림자의 시너지', type: 'element', key: 'shadow', req: 2, desc: '처형 (30% 이하)' },
    { id: 'plasma_boom', name: '플라즈마 시너지', type: 'element', key: 'plasma', req: 2, desc: '폭발 범위 +50%' },
    { id: 'mystic_pierce', name: '신비의 시너지', type: 'element', key: 'mystic', req: 2, desc: '관통 +1' },

    // --- Role (Class) Synergies ---
    { id: 'role_sniper', name: '저격수', type: 'role', key: 'sniper', req: 2, desc: '사거리 +100 & 치명타 +10%' },
    { id: 'role_artillery', name: '포격대', type: 'role', key: 'artillery', req: 2, desc: '폭발 범위 +30%' },
    { id: 'role_assault', name: '돌격대', type: 'role', key: 'assault', req: 2, desc: '공격 속도 +20%' },
    { id: 'role_support', name: '지원가', type: 'role', key: 'support', req: 2, desc: '디버프 지속시간 +50%' }
];

export const THEME = {
    bg: 0x0d0d0f,
    panel: 0x1a1a1e,
    border: 0x4a3a52,
    accent: 0x8b5cf6,
    pathTrack: 0x1e1e24,
    pathGlow: 0x8b5cf6,
    projectileDefault: 0xffeb3b
};


export const ELEMENT_COLORS = {
    fire: 0xef4444,
    ice: 0x3b82f6,
    thunder: 0xfacc15,
    leaf: 0x10b981,
    gem: 0xd8b4fe,
    shadow: 0x7c3aed,
    plasma: 0xe879f9,
    mystic: 0x6366f1,
    tablet: 0x64748b,
    normal: 0xffffff // Normal Theme
};

// 시너지 보너스 상수
export const SYNERGY_BONUSES = {
    // Disabled/Simplified for unified theme
    FIRE_POWER: 1.2,
    ICE_FREEZE: 1.25,
    THUNDER_RAPID: 0.7,
    LEAF_REGEN: 1.15,
    GEM_CRIT_CHANCE: 0.1,
    SHADOW_EXECUTE_THRESHOLD: 0.3,
    PLASMA_AOE_MULT: 1.5,
    MYSTIC_PIERCE_ADD: 1,
    GEM_LEGEND_CRIT: 0.1
};

// 전투 설정 (Combat Configuration)
export const COMBAT_CONFIG = {
    DEFAULT_RANGE: 250,
    DEFAULT_FIRE_RATE: 1000,
    LASER_DAMAGE_MULT: 0.1,
    CRIT_DAMAGE_MULT: 2,
    VULNERABLE_MULT: 1.5,
    CHAIN_JUMP_RANGE: 200,
    BOMB_RADIUS: 150,
    NOVA_RADIUS: 250
};

// 난이도 및 스폰 설정 (Difficulty & Spawn Configuration)
export const DIFFICULTY_CONFIG = {
    HP_PER_MINUTE_RATE: 0.8,       // 분당 HP 증가율 80%
    BASE_SPAWN_INTERVAL: 2500,
    MIN_SPAWN_INTERVAL: 400,
    SPAWN_DECAY_FACTOR: 0.6,       // 난이도에 따른 스폰 주기 감소 계수
    GAME_MINUTE_MS: 60000
};

export const GAME_CONFIG = {
    INITIAL_GOLD: 999999,
    INITIAL_LIVES: 20, // Deprecated but kept for compatibility if needed
    MAX_MONSTERS: 150, // Game Over if exceeded (기존 50 -> 150 상향)
    MONSTER_REWARD: 10,
    COSTS: {
        TABLET: 50,
        ARTIFACT: 150
    }
};

// UI 및 시각 효과 설정 (UI & Visual Configuration)
export const UI_CONFIG = {
    GRID_LINE_ALPHA: 0.2,
    GRID_BG_ALPHA: 0.6,
    PROJECTILE_SPREAD: 20,
    DAMAGE_TEXT_DURATION: 600,
    CRIT_TEXT_DURATION: 800,
    HIT_EFFECT_DURATION: 250,
    TOOLTIP_OFFSET: 15
};

