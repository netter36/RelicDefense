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
    { id: 'gem_legend', name: '보석의 시너지', element: 'gem', req: 2, desc: '치명타 확률 +10% (기본 피해의 2배)' }
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
    tablet: 0x64748b
};

export const MONSTER_TYPES = [
    { id: 'slime', name: '슬라임', hp: 80, speed: 0.001, color: 0x10b981, size: 40, weight: 40 },
    { id: 'guardian', name: '가디언', hp: 300, speed: 0.0004, color: 0x6366f1, size: 55, weight: 20 },
    { id: 'spirit', name: '영혼', hp: 120, speed: 0.0012, color: 0xd8b4fe, size: 30, weight: 30 },
    { id: 'golem', name: '골렘', hp: 600, speed: 0.0002, color: 0x71717a, size: 70, weight: 10 }
];
