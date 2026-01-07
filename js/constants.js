export const GRID_WIDTH = 7;
export const GRID_HEIGHT = 7;
export const SLOT_SIZE = 70;
export const CANVAS_WIDTH = 650;
export const CANVAS_HEIGHT = 650;

export const SYNERGIES = [
    { id: 'fire_power', name: '화염의 시너지', element: 'fire', req: 2, desc: '공격력 +20% (최종 피해량 증가)' },
    { id: 'ice_freeze', name: '혹한의 시너지', element: 'ice', req: 2, desc: '둔화 효율 +25% (적 이동속도 감소)' },
    { id: 'thunder_rapid', name: '전격의 시너지', element: 'thunder', req: 2, desc: '연사 속도 +30% (공격 주기 단축)' },
    { id: 'leaf_regen', name: '생명의 시너지', element: 'leaf', req: 2, desc: '공격 범위 +15% (사거리 증가)' },
    { id: 'gem_legend', name: '보석의 시너지', element: 'gem', req: 2, desc: '치명타 확률 +10% (기본 피해의 2배)' },
    { id: 'shadow_curse', name: '그림자의 시너지', element: 'shadow', req: 2, desc: '처형 (체력 30% 이하 적에게 2배 피해)' },
    { id: 'plasma_boom', name: '플라즈마의 시너지', element: 'plasma', req: 2, desc: '폭발 범위 +50% (광역 공격 효율 증가)' },
    { id: 'mystic_pierce', name: '신비의 시너지', element: 'mystic', req: 2, desc: '관통 +1 (적을 뚫고 뒤의 적 타격)' }
];

export const ATTACK_TYPES = {
    NORMAL: 'normal',
    RAPID: 'rapid',
    LASER: 'laser',
    NOVA: 'nova', // Self-centered AoE
    BOMB: 'bomb', // Ranged Projectile AoE
    MULTI: 'multi',
    CHAIN: 'chain'
};

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
    tablet: 0x64748b
};

// 시너지 보너스 상수
export const SYNERGY_BONUSES = {
    FIRE_POWER: 1.2,          // 공격력 +20%
    ICE_FREEZE: 1.25,         // 디버프 효율 +25%
    THUNDER_RAPID: 0.7,       // 연사 속도 -30%
    LEAF_REGEN: 1.15,         // 사거리 +15%
    GEM_CRIT_CHANCE: 0.1,     // 치명타 확률 +10%
    SHADOW_EXECUTE_THRESHOLD: 0.3, // 체력 30% 이하
    PLASMA_AOE_MULT: 1.5,     // 범위 50% 증가
    MYSTIC_PIERCE_ADD: 1,     // 관통 +1
    GEM_LEGEND_CRIT: 0.1      // 치명타 확률 +10%
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

