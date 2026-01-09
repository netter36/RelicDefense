import Phaser from 'phaser';

export const ATTACK_TYPES = {
    NORMAL: 'normal',
    RAPID: 'rapid',
    LASER: 'laser',
    NOVA: 'nova',
    BOMB: 'bomb',
    MULTI: 'multi',
    CHAIN: 'chain',
    ORBIT: 'orbit',
    BEAM: 'beam',
    RICOCHET: 'ricochet',
    TRAP: 'trap',
    RANDOM_BOMB: 'random_bomb'
} as const;

export type AttackType = typeof ATTACK_TYPES[keyof typeof ATTACK_TYPES];

export const ELEMENTS = {
    FIRE: 'fire',
    ICE: 'ice',
    THUNDER: 'thunder',
    LEAF: 'leaf',
    GEM: 'gem',
    SHADOW: 'shadow',
    PLASMA: 'plasma',
    MYSTIC: 'mystic',
    TABLET: 'tablet',
    NORMAL: 'normal'
} as const;

export type ElementType = typeof ELEMENTS[keyof typeof ELEMENTS];

export const ROLES = {
    SNIPER: 'sniper',
    ARTILLERY: 'artillery',
    ASSAULT: 'assault',
    SUPPORT: 'support'
} as const;

export const DEBUFFS = {
    SLOW: 'slow',
    STUN: 'stun',
    POISON: 'poison',
    VULNERABLE: 'vulnerable'
} as const;

export interface Debuff {
    type: string;
    val?: number;
    duration: number;
    tick?: number;
}

export interface Monster extends Phaser.GameObjects.Container {
    hp: number;
    maxHp: number;
    speed: number;
    t: number;
    debuffs: Debuff[];
    hpBar?: Phaser.GameObjects.Graphics | null;
    hpBarWidth?: number;
    isStatusDirty?: boolean;
    statusG?: Phaser.GameObjects.Graphics;
    difficulty?: number;
    body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
    lastOrbitHit?: { [key: string]: number };
}

export interface TowerStats {
    attackType?: string;
    atk: number;
    range?: number;
    as?: number;
    debuff?: any;
    [key: string]: any;
}

export interface Tower {
    x: number;
    y: number;
    type: string;
    el?: Phaser.GameObjects.Container;
    stats: TowerStats;
    currentAtk?: number;
    critChance?: number;
    critDmgMult?: number;
    activeSynergy?: string;
    executeThreshold?: number;
    pierceCount?: number;
    debuffEfficiency?: number;
    element?: string;
    width: number;
    height: number;
    shape?: number[][];
    activeTraps?: number;
    [key: string]: any;
}


