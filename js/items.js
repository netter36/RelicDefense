export const ITEMS = [
    // --- 석판 (Tablets: 1~2 blocks) ---
    // --- 석판 (Tablets: 1~2 blocks) ---
    { id: 'tablet_1x1', name: '기초 석판', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'atk', val: 5 }, desc: '인접 아티팩트의 공격력을 5% 강화합니다.' },
    { id: 'tablet_1x2', name: '도미노 석판', shape: [[1], [1]], width: 1, height: 2, type: 'tablet', buff: { type: 'atk', val: 10 }, desc: '인접 아티팩트의 공격력을 10% 강화합니다.' },
    { id: 'tablet_2x1', name: '와이드 석판', shape: [[1, 1]], width: 2, height: 1, type: 'tablet', buff: { type: 'atk', val: 10 }, desc: '인접 아티팩트의 공격력을 10% 강화합니다.' },

    // --- 연사형 (Rapid) ---
    {
        id: 'thunder_rapier', name: '뇌광의 세이버', shape: [[1], [1]], width: 1, height: 2, element: 'thunder', type: 'artifact',
        stats: { atk: 12, range: 250, fireRate: 80, attackType: 'rapid', burstCount: 6, reloadTime: 1200 },
        desc: '고압의 전류를 검신에 모아 전방으로 6회 연속 투사합니다.',
        flavor: '"찌르는 뇌격은 소리보다 빠르다."'
    },
    {
        id: 'thunder_heavy', name: '폭풍의 쐐기', shape: [[1, 1], [1, 0]], width: 2, height: 2, element: 'thunder', type: 'artifact',
        stats: { atk: 22, range: 300, fireRate: 100, attackType: 'rapid', burstCount: 10, reloadTime: 1800 },
        desc: '주변의 대기를 이온화하여 10발의 뇌전을 폭풍처럼 쏟아냅니다.',
        flavor: '"그것은 재앙을 부르는 말뚝."'
    },

    // --- 레이저형 (Laser) ---
    {
        id: 'fire_laser', name: '태양의 창', shape: [[1, 1, 1]], width: 3, height: 1, element: 'fire', type: 'artifact',
        stats: { atk: 8, range: 450, fireRate: 50, attackType: 'laser' },
        desc: '고열의 플라즈마를 일직선으로 방출하여 닿는 모든 것을 녹입니다.',
        flavor: '"태양의 분노는 피할 수 없다."'
    },
    {
        id: 'gem_laser', name: '심연의 광선', shape: [[1, 1], [0, 1]], width: 2, height: 2, element: 'gem', type: 'artifact',
        stats: { atk: 15, range: 500, fireRate: 30, attackType: 'laser' },
        desc: '증폭된 심연의 마력을 공명시켜 초장거리의 광선을 발사합니다.',
        flavor: '"심연을 들여다보는 자, 시력을 잃으리라."'
    },

    // --- 광역 공격형 (AoE) ---
    {
        id: 'ice_nova', name: '혹한의 파동', shape: [[1, 1]], width: 2, height: 1, element: 'ice', type: 'artifact',
        stats: { atk: 25, range: 220, fireRate: 1500, attackType: 'nova', aoeRadius: 100 },
        desc: '대기 중의 수분을 순간적으로 응결시켜 주변을 혹한의 지옥으로 만듭니다.',
        flavor: '"절대 영도의 침묵."'
    },
    {
        id: 'leaf_blast', name: '대지의 폭발', shape: [[1, 0], [1, 1]], width: 2, height: 2, element: 'leaf', type: 'artifact',
        stats: { atk: 35, range: 250, fireRate: 2000, attackType: 'bomb', aoeRadius: 150 },
        desc: '폭발성 씨앗을 투척하여 넓은 범위에 자연의 분노를 터뜨립니다.',
        flavor: '"대지는 기억한다."'
    },

    // --- 일반형 (Normal) ---
    {
        id: 'fire_cannon', name: '화염의 비사', shape: [[1, 1]], width: 2, height: 1, element: 'fire', type: 'artifact',
        stats: { atk: 45, range: 280, fireRate: 1200, attackType: 'normal' },
        desc: '압축된 화염구를 곡사로 날려 강력한 폭발을 일으킵니다.',
        flavor: '"전장의 포병."'
    },
    {
        id: 'leaf_bow', name: '선령의 활', shape: [[1], [1], [1]], width: 1, height: 3, element: 'leaf', type: 'artifact',
        stats: { atk: 20, range: 400, fireRate: 800, attackType: 'normal' },
        desc: '바람의 정령이 깃든 화살을 날려 먼 거리의 적을 저격합니다.',
        flavor: '"바람은 볼 수 없지만 느낄 수 있지."'
    },
    // --- 특수형 (Special) ---
    {
        id: 'judgement_prism', name: '심판의 프리즘', shape: [[1, 0], [1, 1]], width: 2, height: 2, element: 'gem', type: 'artifact',
        stats: { atk: 18, range: 350, fireRate: 1200, attackType: 'chain', chainCount: 3 },
        desc: '빛을 굴절시켜 다수의 적을 연쇄적으로 타격합니다.',
        flavor: '"죄 지은 자, 숨을 곳은 없다."'
    },
    {
        id: 'chaos_orb', name: '혼돈의 구슬', shape: [[1, 1], [1, 0]], width: 2, height: 2, element: 'fire', type: 'artifact',
        stats: { atk: 15, range: 300, fireRate: 1000, attackType: 'multi', projectileCount: 3 },
        desc: '불안정한 마력을 흩뿌려 여러 적을 동시에 요격합니다.',
        flavor: '"질서는 무너지고, 혼돈만이 남으리라."'
    },

    // --- 디버프형 (Support/Debuff) ---
    {
        id: 'leaf_spore', name: '맹독 포자', shape: [[1, 1], [1, 0]], width: 2, height: 2, element: 'leaf', type: 'artifact',
        stats: { atk: 10, range: 250, fireRate: 900, attackType: 'normal', debuff: { type: 'poison', val: 5, duration: 4000 } },
        desc: '강력한 독소를 품은 포자를 날려 적을 중독시킵니다.',
        flavor: '"숨을 쉴수록 고통스러울 것이다."'
    },
    {
        id: 'thunder_static', name: '마비의 지팡이', shape: [[1], [1]], width: 1, height: 2, element: 'thunder', type: 'artifact',
        stats: { atk: 8, range: 300, fireRate: 1500, attackType: 'chain', chainCount: 2, debuff: { type: 'stun', duration: 800, chance: 0.5 } },
        desc: '전류를 방출하여 적을 연쇄적으로 마비시킵니다.',
        flavor: '"순간의 정적."'
    },
    {
        id: 'gem_curse', name: '공허의 눈', shape: [[1, 1], [1, 1]], width: 2, height: 2, element: 'gem', type: 'artifact',
        stats: { atk: 15, range: 450, fireRate: 2000, attackType: 'laser', debuff: { type: 'vulnerable', val: 1.5, duration: 3000 } },
        desc: '적의 약점을 노출시켜 받는 피해를 50% 증가시킵니다.',
        flavor: '"네 약점은 이미 파악되었다."'
    },
    {
        id: 'ice_shard', name: '서리 파편', shape: [[1]], width: 1, height: 1, element: 'ice', type: 'artifact',
        stats: { atk: 12, range: 220, fireRate: 1100, attackType: 'normal', debuff: { type: 'slow', val: 0.6, duration: 2500 } },
        desc: '날카로운 얼음 조각으로 적의 움직임을 크게 둔화시킵니다.',
        flavor: '"발걸음이 무거워질 것이다."'
    }
];
