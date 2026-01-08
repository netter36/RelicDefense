export const ITEMS = [
    // --- 모듈 (Modules: 1×1 모노미노) ---
    { id: 'tablet_basic', name: '증폭기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'atk', val: 15 }, desc: '인접 아티팩트의 공격력을 15% 강화합니다.' },
    { id: 'tablet_range', name: '망원경', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'range', val: 20 }, desc: '인접 아티팩트의 사거리를 20% 증가시킵니다.' },
    { id: 'tablet_focus', name: '과부하', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'focus', val: 30, penalty: 20 }, desc: '인접 아티팩트의 공격력을 30% 증가시키지만, 사거리가 20% 감소합니다.' },
    { id: 'tablet_speed', name: '가속기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'speed', val: 20 }, desc: '인접 아티팩트의 공격 속도를 20% 증가시킵니다.' },
    { id: 'tablet_crit', name: '정밀 조준경', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'crit', val: 15 }, desc: '인접 아티팩트의 치명타 확률을 15% 증가시킵니다.' },
    { id: 'tablet_area', name: '확장기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'area', val: 30 }, desc: '인접 아티팩트의 폭발 범위를 30% 증가시킵니다. (광역 무기 전용)' },

    // --- 공격형 아티팩트 (Unified Normal Theme) ---
    
    // 1. RAPID (연사형)
    {
        id: 'thunder_rapier', name: '래피드 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 25, range: 280, fireRate: 80, attackType: 'rapid', burstCount: 6, reloadTime: 1000 },
        desc: '전방으로 투사체를 고속으로 연속 발사합니다.',
        flavor: '"속도가 생명이다."'
    },
    
    // 2. LASER (레이저형)
    {
        id: 'fire_laser', name: '레이저 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 18, range: 450, fireRate: 50, attackType: 'laser' },
        desc: '일직선으로 관통하는 광선을 발사합니다.',
        flavor: '"정밀 타격."'
    },

    // 3. NOVA (자신 주변 광역)
    {
        id: 'ice_nova', name: '노바 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 60, range: 250, fireRate: 1200, attackType: 'nova', aoeRadius: 140 },
        desc: '주변 모든 적에게 충격파를 발생시킵니다.',
        flavor: '"접근 거부."'
    },

    // 4. BOMB (원거리 폭발)
    {
        id: 'leaf_blast', name: '밤 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 80, range: 280, fireRate: 1800, attackType: 'bomb', aoeRadius: 180 },
        desc: '폭발성 탄환을 투척하여 범위 피해를 입힙니다.',
        flavor: '"화력 지원."'
    },

    // 5. NORMAL (일반형)
    {
        id: 'fire_cannon', name: '캐논 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 90, range: 300, fireRate: 1000, attackType: 'normal' },
        desc: '강력한 단일 투사체를 발사합니다.',
        flavor: '"기본에 충실하라."'
    },

    // 6. CHAIN (체인 라이트닝)
    {
        id: 'judgement_prism', name: '체인 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 40, range: 380, fireRate: 1100, attackType: 'chain', chainCount: 4 },
        desc: '적을 타고 흐르는 연쇄 공격을 가합니다.',
        flavor: '"일망타진."'
    },

    // 7. MULTI (산탄/다중)
    {
        id: 'chaos_orb', name: '멀티 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 35, range: 320, fireRate: 900, attackType: 'multi', projectileCount: 4 },
        desc: '여러 발의 투사체를 동시에 발사합니다.',
        flavor: '"다수에는 다수로."'
    },

    // 8. ORBIT (위성)
    {
        id: 'orbit_prism', name: '오비탈 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 35, range: 0, fireRate: 0, attackType: 'orbit', orbitCount: 4, orbitSpeed: 0.06, orbitRadius: 90, hitCooldown: 400 },
        desc: '타워 주위를 회전하는 위성으로 적을 공격합니다.',
        flavor: '"철벽 방어."'
    },

    // 9. BEAM (방사형)
    {
        id: 'fire_thrower', name: '빔 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 12, range: 220, fireRate: 150, attackType: 'beam', coneAngle: 0.8 }, 
        desc: '전방에 지속적인 범위 피해를 입힙니다.',
        flavor: '"모두 쓸어버려라."'
    },

    // 10. RICOCHET (도탄)
    {
        id: 'shadow_ricochet', name: '리코쳇 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 45, range: 400, fireRate: 1200, attackType: 'ricochet', ricochetCount: 3 },
        desc: '적에게 부딪히면 튕기는 투사체를 발사합니다.',
        flavor: '"예측 불가능."'
    },

    // 11. TRAP (지뢰)
    {
        id: 'spider_mine', name: '트랩 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 150, range: 300, fireRate: 3000, attackType: 'trap', aoeRadius: 120, maxTraps: 5, duration: 15000 },
        desc: '경로상에 지뢰를 매설합니다.',
        flavor: '"함정 발동."'
    },

    // 12. RANDOM_BOMB (무차별 폭격)
    {
        id: 'mortar_cannon', name: '박격포 타워', shape: [[1, 1]], width: 2, height: 1, element: 'normal', type: 'artifact',
        stats: { atk: 120, range: 350, fireRate: 2000, attackType: 'random_bomb', aoeRadius: 160 },
        desc: '사거리 내의 무작위 위치를 폭격합니다.',
        flavor: '"지원 사격 개시."'
    }
];
