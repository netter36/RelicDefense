# 🎮 Relic Defense

**Inventory Puzzle × Tower Defense**

A strategic tower defense game where you place artifact relics strategically to defend against endless waves of enemies.

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-GitHub_Pages-blue?style=for-the-badge)](https://netter36.github.io/RelicDefense/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.60.0-9e59ff)](https://phaser.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e)](https://www.javascript.com/)

---

## 📋 목차

1. [게임 개요](#게임-개요)
2. [주요 특징](#주요-특징)
3. [핵심 시스템](#핵심-시스템)
4. [유물 도감](#유물-도감)
5. [몬스터 정보](#몬스터-정보)
6. [조작법](#조작법)
7. [기술 스택](#기술-스택)
8. [프로젝트 구조](#프로젝트-구조)
9. [디자인 철학](#디자인-철학)
10. [로컬 실행](#로컬-실행)
11. [개발 가이드](#개발-가이드)
12. [게임 밸런스](#게임-밸런스)
13. [성능 최적화](#성능-최적화)
14. [라이선스](#라이선스)
15. [기여 방법](#기여-방법)

---

## 🎯 게임 개요

### 장르  
- 전략형 타워 디펜스 + 인벤토리 퍼즐  
- 7×7 격자 위에 유물을 배치해 적을 물리치는 실시간 전투

### 핵심 메커니즘  
1. **그리드 기반 배치**  
   - 테트리스 스타일의 배치, 1×1~3×3까지 다양한 유물  
2. **속성 시너지**  
   - 같은 속성을 인접 배치 시 강화 효과 발생  
3. **다양한 공격 타입**  
   - 7가지 기본 타입 + 특수 비주얼 이펙트  
4. **진행형 난이도**  
   - 시간에 따라 적의 체력·속도 상승  
5. **실시간 전투**  
   - 60 FPS 부드러운 액션  
6. **성능 모니터링**  
   - 실시간 FPS 카운터 제공  

### 게임 목표  
- 최적의 공간 활용과 시너지 활용으로 무한 적 웨이브를 견뎌내는 **방어 요새**를 건설  
- 유물과 공격 타입을 조합해 **최강 조합**을 찾아내기  

---

## ✨ 주요 특징

| 항목 | 내용 |
|------|------|
| **혁신적인 배치 시스템** | 유물을 격자에 배치해 공간 활용 극대화<br>드래그 앤 드롭으로 언제든 재배치 가능 |
| **전략적 깊이** | 속성 시너지와 공격 타입 선택으로 전략적 옵션 제공 |
| **시각적 완성도** | 픽셀 아트 스타일의 절차적 그래픽<br>각 유물은 고유 색상·아이콘으로 구분 |
| **진행형 난이도** | 적이 점점 강해짐에 따라 전투가 난해해지는 리플레이성 확보 |

---

## 🔧 핵심 시스템

### 1. 그리드 & 배치 시스템
- **격자 사양**: 7×7, 70×70 픽셀 칸
- **배치 규칙**: 충돌 검사, 공간이 부족하면 배치 불가
- **스마트 배치 알고리즘**  
```js
// src/systems/GridSystem.js
for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
        if (canPlace(item, x, y)) return { x, y };
    }
}
```

### 2. 속성 시너지 시스템
- **발동 조건**: 같은 속성 유물이 상하좌우로 연결된 경우
- **시너지 종류**: Fire, Ice, Thunder, Leaf, Gem, Shadow, Plasma, Mystic
- **계산 알고리즘**  
```js
// src/systems/GridSystem.js
const bfs = (start) => { /* 연결 탐색 */ };
if (activeSynergies.has('fire')) stats.atk *= 1.2;
```

### 3. 전투 시스템
- **공격 타입**: Normal, Rapid, Laser, Nova, Bomb, Multi, Chain + 특수 이펙트
- **전투 메커니즘**: 거리 기반 타겟팅, 회전 가능
- **치명타 시스템**: 확률 기반 2배 데미지

### 4. 디버프 시스템
- **디버프 종류**: Slow, Stun, Poison, Bleed
- **효율**: Ice 시너지로 +25% 효율

### 5. 유물 시스템
- **등급**: Tablet (1×1), Artifact (1×2~3×3)
- **각 유물**: `js/data/items.js`에 정의

---

## 📚 유물 도감

| 속성 | 대표 유물 | 공격 타입 | 효과 |
|------|-----------|-----------|------|
| 🔥 Fire | 화염의 검 | Normal | 공격력 +20% |
| ❄️ Ice | 혹한의 파동 | Nova | 적 둔화 60% |
| ⚡ Thunder | 번개 사신 | Rapid | 공격 속도 +30% |
| 🌿 Leaf | 자연의 활 | Normal | 사거리 +15% |
| 💎 Gem | 보석의 비사 | Multi | 치명타 확률 +10% |
| 🌑 Shadow | 그림자 사신 | Chain | 30% 이하 HP 적 두배 데미지 |
| 🔮 Plasma | 플라즈마 광선 | Laser | 범위 +50% |
| ✨ Mystic | 신비의 비사 | Arrow Rain | 관통 +1 |

---

## 👹 몬스터 정보

| 종류 | 체력 | 속도 | 특징 |
|------|------|------|------|
| 슬라임 | 80 | 보통 | 기본형 |
| 영혼 | 120 | 빠름 | 낮은 체력 |
| 가디언 | 300 | 느림 | 탱커형 |
| 골렘 | 600 | 매우 느림 | 보스급 체력 |

---

## 🕹️ 조작법

| 입력 | 동작 | 설명 |
|------|------|------|
| **좌클릭(상점)** | 유물 구매 | 빈 공간에 자동 배치 |
| **좌클릭 드래그(그리드)** | 유물 이동 | 위치 변경 |
| **우클릭(그리드)** | 유물 판매 | 자원 회수 |
| **R 키** | 회전 | 90도 회전 (도미노만) |
| **마우스 오버** | 정보 표시 | 유물 상세 스탯 |

### UI 정보
- **좌측 패널**: 시너지, 통계
- **우측 패널**: 상점, 필터

---

## 🛠️ 기술 스택

- **프론트엔드**: Phaser 3.60.0, Vanilla JS, CSS3
- **폰트**: Press Start 2P, Orbit
- **개발 도구**: Git, VS Code, Node.js, npm

---

## 📁 프로젝트 구조

```
📁 src/
├─ index.html
├─ js/
│   ├─ systems/
│   │   ├─ GridSystem.js
│   │   ├─ TowerSystem.js
│   │   ├─ EnemySystem.js
│   │   └─ UIManager.js
│   ├─ data/
│   │   ├─ items.js
│   │   └─ monsters.js
│   └─ constants.js
├─ style.css
└─ dist/          # 빌드 결과물
```

---

## 🎨 디자인 철학

- **절차적 그래픽**: 색상·아이콘을 코드에서 생성
- **색상 테마**: 각 속성별 고유 색상
- **UI/UX**: 다크 모드 지원, 반응형 디자인

---

## 🚀 로컬 실행

### 1. 시스템 요구사항

| 항목 | 필수 | 권장 |
|------|------|------|
| 브라우저 | Chrome 90+ | 최신 브라우저 |
| 메모리 | 4GB | 8GB |
| CPU | 듀얼 코어 2GHz | 쿼드 코어 3GHz |

### 2. 설치 및 실행

#### 방법 1: Python (가장 간단)
```bash
# 1. 저장소 클론
git clone https://github.com/username/TestWebGame.git
cd TestWebGame

# 2. Python 내장 서버 실행
python -m http.server 8000
# 또는 Python 2
python -m SimpleHTTPServer 8000

# 3. 브라우저에서 열기
# http://localhost:8000
```

#### 방법 2: Node.js
```bash
# 1. 저장소 클론
git clone https://github.com/username/TestWebGame.git
cd TestWebGame

# 2. http-server 설치 및 실행
npm install -g http-server
http-server -p 8000

# 3. 브라우저에서 열기
# http://localhost:8000
```

#### 방법 3: VS Code Live Server
- VS Code에서 `Live Server` 확장 설치 후 `index.html` 우클릭 → `Open with Live Server`

#### 방법 4: 직접 파일 열기 (권장하지 않음)
- `index.html` 직접 열면 CORS 오류 발생 가능

### 3. 설치 확인
- **첫 화면**: 7×7 격자와 상점이 표시
- **게임 시작**: 적이 자동으로 스폰

### 4. 문제 해결
- **CORS 오류**: Python/Node.js 서버 사용
- **게임이 로드되지 않음**: 콘솔 에러 확인, 캐시 삭제

---

## 💻 개발 가이드

### 🏗️ 새로운 유물 추가
1. **데이터 등록** (`js/data/items.js`)  
   ```js
   // js/data/items.js
   export const items = [
     {
       id: 'fire_sword',
       name: '화염의 검',
       shape: 'sword',
       width: 1,
       height: 2,
       element: 'fire',
       type: 'artifact',
       stats: { atk: 100, range: 100, fireRate: 1000, attackType: 'normal' },
       desc: '화염 속성의 강력한 검',
       flavor: '불길이 타오르는 검'
     }
   ];
   ```

2. **형태 정의** (`js/constants.js`)  
   ```js
   // js/constants.js
   export const SHAPES = {
     sword: [[1],[1],[1]],
     // ...
   };
   ```

3. **시너지 정의** (`js/constants.js`)  
   ```js
   // js/constants.js
   export const SYNERGIES = [
     { id: 'fire_synergy', name: '화염 시너지', element: 'fire', req: 2, desc: '공격력 +20%' }
   ];
   ```

4. **GridSystem.js**에서 시너지 적용  
   ```js
   // src/systems/GridSystem.js
   if (activeSynergies.has('fire_synergy')) {
     stats.atk *= 1.2;
   }
   ```

### 🎨 새로운 속성 추가
- **색상 추가** (`js/constants.js`)  
  ```js
  // js/constants.js
  export const ELEMENT_COLORS = {
    fire: '#FF4444',
    ice: '#44AAFF',
    // ...
  };
  ```

### ⚔️ 새로운 공격 타입 추가
- **상수 추가** (`js/constants.js`)  
  ```js
  // js/constants.js
  export const ATTACK_TYPES = { normal: 'Normal', rapid: 'Rapid', /*...*/ };
  ```
- **TowerSystem.js**에서 로직 구현  
  ```js
  // src/systems/TowerSystem.js
  if (artifact.attackType === ATTACK_TYPES.laser) {
    // 레이저 공격 구현
  }
  ```

### 🐛 디버깅 팁
- **콘솔 로그**  
  ```js
  console.log('유물 수:', gridSystem.placedItems.length);
  ```
- **Phaser 디버그**  
  ```js
  // src/main.js
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: true } }
  };
  ```

### 📊 성능 프로파일링
```js
// src/main.js
const startTime = performance.now();
// 게임 루프 실행
const endTime = performance.now();
console.log(`실행 시간: ${endTime - startTime} ms`);
```

---

## ⚖️ 게임 밸런스

| 항목 | 내용 |
|------|------|
| **경제 시스템** | 골드 획득, 유물 구매 및 업그레이드 |
| **난이도 곡선** | 시간에 따라 적의 체력/속도 상승 |
| **밸런싱 철학** | 모든 속성과 유물이 균형 있게 설계되도록 노력 |

---

## ⚡ 성능 최적화

| 영역 | 최적화 방법 |
|------|------------|
| **오브젝트 풀링** | 투사체·효과 재사용 |
| **렌더링 최적화** | 비활성 오브젝트 숨김, 배치 단위 그리기 |
| **계산 최적화** | 거리 계산 시 제곱근 생략, BFS 캐시 활용 |
| **성능 모니터링** | FPS 카운터, 타임스탬프 기록 |

---

## 📄 라이선스
MIT License – 자유롭게 사용, 수정 및 배포 가능

---

## 🤝 기여 방법

1. **Fork** → 로컬에서 작업  
2. **Pull Request** 제출  
3. 코드 리뷰 후 Merge

> 문의 사항은 Issues에 등록해 주세요.