export const ITEMS = [
    // --- 모듈 (Modules: 1×1 모노미노) ---
    { id: 'tablet_basic', name: '증폭기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'atk', val: 15 }, desc: '인접 아티팩트의 공격력을 15% 강화합니다.' },
    { id: 'tablet_range', name: '망원경', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'range', val: 20 }, desc: '인접 아티팩트의 사거리를 20% 증가시킵니다.' },
    { id: 'tablet_focus', name: '과부하', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'focus', val: 30, penalty: 20 }, desc: '인접 아티팩트의 공격력을 30% 증가시키지만, 사거리가 20% 감소합니다.' },
    { id: 'tablet_speed', name: '가속기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'speed', val: 20 }, desc: '인접 아티팩트의 공격 속도를 20% 증가시킵니다.' },
    { id: 'tablet_crit', name: '정밀 조준경', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'crit', val: 15 }, desc: '인접 아티팩트의 치명타 확률을 15% 증가시킵니다.' },
    { id: 'tablet_area', name: '확장기', shape: [[1]], width: 1, height: 1, type: 'tablet', buff: { type: 'area', val: 30 }, desc: '인접 아티팩트의 폭발 범위를 30% 증가시킵니다. (광역 무기 전용)' },

    // --- 연사형 (Rapid) ---
    {
        id: 'thunder_rapier', name: '뇌전검: 섬광', shape: [[1], [1]], width: 1, height: 2, element: 'thunder', role: 'assault', type: 'artifact',
        stats: { atk: 25, range: 280, fireRate: 80, attackType: 'rapid', burstCount: 6, reloadTime: 1000 },
        desc: '고압의 전류를 검신에 모아 전방으로 6회 연속 투사합니다.',
        flavor: '"베는 것보다 찌르는 것이 빠르다."'
    },
    {
        id: 'thunder_heavy', name: '뇌신: 천둥망치', shape: [[1, 1]], width: 2, height: 1, element: 'thunder', role: 'artillery', type: 'artifact',
        stats: { atk: 45, range: 320, fireRate: 100, attackType: 'rapid', burstCount: 10, reloadTime: 1500 },
        desc: '주변의 대기를 이온화하여 10발의 뇌전을 폭풍처럼 쏟아냅니다.',
        flavor: '"하늘이 분노하노라."'
    },

    // --- 레이저형 (Laser) ---
    {
        id: 'fire_laser', name: '솔라 빔', shape: [[1, 1]], width: 2, height: 1, element: 'fire', role: 'sniper', type: 'artifact',
        stats: { atk: 18, range: 450, fireRate: 50, attackType: 'laser' },
        desc: '고열의 플라즈마를 일직선으로 방출하여 닿는 모든 것을 녹입니다.',
        flavor: '"태양의 열기를 견딜 수 있겠나?"'
    },
    {
        id: 'gem_laser', name: '공허 포격기', shape: [[1], [1]], width: 1, height: 2, element: 'gem', role: 'sniper', type: 'artifact',
        stats: { atk: 35, range: 550, fireRate: 30, attackType: 'laser' },
        desc: '증폭된 심연의 마력을 공명시켜 초장거리의 광선을 발사합니다.',
        flavor: '"심연은 그저 바라볼 뿐이다."'
    },

    // --- 광역 공격형 (AoE) ---
    {
        id: 'ice_nova', name: '프로스트 노바', shape: [[1, 1]], width: 2, height: 1, element: 'ice', role: 'artillery', type: 'artifact',
        stats: { atk: 60, range: 250, fireRate: 1200, attackType: 'nova', aoeRadius: 140 },
        desc: '대기 중의 수분을 순간적으로 응결시켜 주변을 혹한의 지옥으로 만듭니다.',
        flavor: '"모든 것을 얼려버려라."'
    },
    {
        id: 'leaf_blast', name: '대지의 분노', shape: [[1, 1]], width: 2, height: 1, element: 'leaf', role: 'artillery', type: 'artifact',
        stats: { atk: 80, range: 280, fireRate: 1800, attackType: 'bomb', aoeRadius: 180 },
        desc: '폭발성 씨앗을 투척하여 넓은 범위에 자연의 힘을 터뜨립니다.',
        flavor: '"자연은 결코 자비롭지 않다."'
    },

    // --- 일반형 (Normal) ---
    {
        id: 'fire_cannon', name: '이그니스 캐논', shape: [[1, 1]], width: 2, height: 1, element: 'fire', role: 'artillery', type: 'artifact',
        stats: { atk: 90, range: 300, fireRate: 1000, attackType: 'normal' },
        desc: '압축된 화염구를 곡사로 날려 강력한 폭발을 일으킵니다.',
        flavor: '"불타버려라!"'
    },
    {
        id: 'leaf_bow', name: '실바나스의 활', shape: [[1], [1]], width: 1, height: 2, element: 'leaf', role: 'sniper', type: 'artifact',
        stats: { atk: 45, range: 450, fireRate: 600, attackType: 'normal' },
        desc: '바람의 정령이 깃든 화살을 날려 먼 거리의 적을 저격합니다.',
        flavor: '"바람이 나를 이끈다."'
    },
    // --- 특수형 (Special) ---
    {
        id: 'judgement_prism', name: '심판의 빛', shape: [[1, 1]], width: 2, height: 1, element: 'gem', role: 'assault', type: 'artifact',
        stats: { atk: 40, range: 380, fireRate: 1100, attackType: 'chain', chainCount: 4 },
        desc: '빛을 굴절시켜 다수의 적을 연쇄적으로 타격합니다.',
        flavor: '"정의는 실현될 것이다."'
    },
    {
        id: 'chaos_orb', name: '혼돈의 보주', shape: [[1], [1]], width: 1, height: 2, element: 'fire', role: 'assault', type: 'artifact',
        stats: { atk: 35, range: 320, fireRate: 900, attackType: 'multi', projectileCount: 4 },
        desc: '불안정한 마력을 흩뿌려 여러 적을 동시에 요격합니다.',
        flavor: '"혼돈 그 자체."'
    },

    // --- 디버프형 (Support/Debuff) ---
    {
        id: 'leaf_spore', name: '베놈 스프레이', shape: [[1, 1]], width: 2, height: 1, element: 'leaf', role: 'support', type: 'artifact',
        stats: { atk: 25, range: 280, fireRate: 800, attackType: 'normal', debuff: { type: 'poison', val: 10, duration: 5000 } },
        desc: '강력한 독소를 품은 포자를 날려 적을 중독시킵니다.',
        flavor: '"고통스러운 죽음을 맞이하라."'
    },
    {
        id: 'thunder_static', name: '스태틱 완드', shape: [[1], [1]], width: 1, height: 2, element: 'thunder', role: 'support', type: 'artifact',
        stats: { atk: 20, range: 320, fireRate: 1400, attackType: 'chain', chainCount: 3, debuff: { type: 'stun', duration: 1000, chance: 0.6 } },
        desc: '전류를 방출하여 적을 연쇄적으로 마비시킵니다.',
        flavor: '"움직일 수 없을걸?"'
    },
    {
        id: 'gem_curse', name: '사우론의 눈', shape: [[1, 1]], width: 2, height: 1, element: 'gem', role: 'support', type: 'artifact',
        stats: { atk: 30, range: 480, fireRate: 1800, attackType: 'laser', debuff: { type: 'vulnerable', val: 1.8, duration: 4000 } },
        desc: '적의 약점을 노출시켜 받는 피해를 80% 증가시킵니다.',
        flavor: '"너의 약점이 보인다."'
    },
    {
        id: 'ice_shard', name: '빙결의 창', shape: [[1, 1]], width: 2, height: 1, element: 'ice', role: 'support', type: 'artifact',
        stats: { atk: 30, range: 250, fireRate: 900, attackType: 'normal', debuff: { type: 'slow', val: 0.5, duration: 3000 } },
        desc: '날카로운 얼음 조각으로 적의 움직임을 50% 둔화시킵니다.',
        flavor: '"얼어붙어라."'
    },

    // --- 그림자 (Shadow) ---
    {
        id: 'shadow_dagger', name: '팬텀 블레이드', shape: [[1], [1]], width: 1, height: 2, element: 'shadow', role: 'assault', type: 'artifact',
        stats: { atk: 40, range: 240, fireRate: 400, attackType: 'rapid', burstCount: 3, reloadTime: 800 },
        desc: '보이지 않는 속도로 적의 급소를 연속 가격합니다.',
        flavor: '"그림자처럼 은밀하게."'
    },
    {
        id: 'shadow_orb', name: '다크 매터', shape: [[1, 1]], width: 2, height: 1, element: 'shadow', role: 'sniper', type: 'artifact',
        stats: { atk: 65, range: 420, fireRate: 1100, attackType: 'normal' },
        desc: '적을 추적하는 암흑 에너지를 발사합니다.',
        flavor: '"어둠이 너를 삼키리라."'
    },
    {
        id: 'shadow_scythe', name: '소울 리퍼', shape: [[1, 1]], width: 2, height: 1, element: 'shadow', role: 'assault', type: 'artifact',
        stats: { atk: 90, range: 320, fireRate: 1600, attackType: 'chain', chainCount: 5 },
        desc: '영혼을 수확하는 낫을 휘둘러 다수의 적을 베어냅니다.',
        flavor: '"영혼을 거두러 왔다."'
    },

    // --- 플라즈마 (Plasma) ---
    {
        id: 'plasma_launcher', name: '플라즈마 캐논', shape: [[1, 1]], width: 2, height: 1, element: 'plasma', role: 'artillery', type: 'artifact',
        stats: { atk: 110, range: 420, fireRate: 1800, attackType: 'bomb', aoeRadius: 180 },
        desc: '불안정한 플라즈마 구체를 날려 광범위한 폭발을 일으킵니다.',
        flavor: '"폭발적인 위력."'
    },
    {
        id: 'plasma_flux', name: '플럭스 라이플', shape: [[1], [1]], width: 1, height: 2, element: 'plasma', role: 'assault', type: 'artifact',
        stats: { atk: 40, range: 320, fireRate: 450, attackType: 'multi', projectileCount: 4 },
        desc: '전방으로 플라즈마 입자를 흩뿌려 탄막을 형성합니다.',
        flavor: '"빛의 비를 내려주지."'
    },
    {
        id: 'plasma_core', name: '뉴클리어 코어', shape: [[1, 1]], width: 2, height: 1, element: 'plasma', role: 'artillery', type: 'artifact',
        stats: { atk: 250, range: 280, fireRate: 2500, attackType: 'nova', aoeRadius: 300 },
        desc: '핵융합 반응을 임계점까지 끌어올려 주변을 증발시킵니다.',
        flavor: '"모든 것을 태워버려라."'
    },

    // --- 신비 (Mystic) ---
    {
        id: 'mystic_bolt', name: '아케인 볼트', shape: [[1], [1]], width: 1, height: 2, element: 'mystic', role: 'sniper', type: 'artifact',
        stats: { atk: 55, range: 480, fireRate: 1000, attackType: 'normal' },
        desc: '적을 관통하는 비전 마법의 화살을 발사합니다.',
        flavor: '"마법의 힘을 보여주지."'
    },
    {
        id: 'mystic_prism', name: '스타폴 프리즘', shape: [[1], [1]], width: 1, height: 2, element: 'mystic', role: 'assault', type: 'artifact',
        stats: { atk: 35, range: 420, fireRate: 1300, attackType: 'multi', projectileCount: 4 },
        desc: '마력을 여러 갈래로 분산시켜 다수의 적을 동시에 꿰뚫습니다.',
        flavor: '"별들이 쏟아진다."'
    },
    {
        id: 'mystic_scroll', name: '고대 비전서', shape: [[1, 1]], width: 2, height: 1, element: 'mystic', role: 'sniper', type: 'artifact',
        stats: { atk: 85, range: 550, fireRate: 1800, attackType: 'laser' },
        desc: '강력한 고대 주문을 영창하여 전방의 적들을 소멸시킵니다.',
        flavor: '"지식은 곧 힘이다."'
    }
];
