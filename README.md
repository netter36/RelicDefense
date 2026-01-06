# 🎮 Relic Defense

**인벤토리 퍼즐 × 타워 디펜스**

속성이 부여된 유물(아티팩트)을 전략적으로 배치하여 끝없이 몰려오는 적들을 막아내는 전략형 타워 디펜스 게임입니다.

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-GitHub_Pages-blue?style=for-the-badge)](https://netter36.github.io/RelicDefense/)

---

## ✨ 주요 특징

- 🧩 **테트리스 스타일 배치**: 다양한 형태의 유물을 격자에 퍼즐처럼 배치
- ⚔️ **7가지 공격 타입**: Normal, Rapid, Laser, Nova, Bomb, Multi, Chain
- 🔗 **속성 시너지 시스템**: 같은 속성을 인접 배치하여 강력한 보너스 획득
- 📈 **무한 난이도 증가**: 시간이 지날수록 강해지는 적들
- 🎨 **절차적 그래픽**: 각 유물은 고유한 디자인으로 생성

---

## 🎯 게임 플레이

### 핵심 메커니즘

1. **유물 구매 & 배치**
   - 상점에서 유물을 구매하면 자동으로 빈 공간에 배치
   - 드래그로 위치 조정, 우클릭으로 판매

2. **시너지 발동**
   - 같은 속성의 유물을 상하좌우로 인접 배치
   - 활성화된 유물은 하얀 테두리 효과 표시

3. **적 방어**
   - 자동으로 사거리 내 적을 공격
   - 다양한 공격 타입을 조합하여 최적의 방어선 구축

---

## 🔥 속성 시너지

같은 속성을 **인접하게** 배치하면 강력한 보너스 획득!

| 속성 | 시너지 이름 | 효과 | 전략 |
|:---:|:---:|:---|:---|
| 🔥 | **Fire Power** | 공격력 **+20%** | 메인 딜러 화력 극대화 |
| ❄️ | **Ice Freeze** | 디버프 효율 **+25%** | 적 둔화로 시간 확보 |
| ⚡ | **Thunder Rapid** | 공속 **+30%** | 다수의 적 빠르게 처리 |
| 🌿 | **Leaf Regen** | 사거리 **+15%** | 넓은 범위 커버 |
| 💎 | **Gem Legend** | 치명타 **+10%** | 폭발 데미지로 보스 처리 |

---

## ⚔️ 공격 타입

- **Normal**: 표준 단일 표적 공격
- **Rapid**: 빠른 연사 공격 (낮은 데미지)
- **Laser**: 지속 빔 공격
- **Nova**: 주변 모든 적 동시 공격
- **Bomb**: 광역 폭발 공격
- **Multi**: 여러 발 동시 발사
- **Chain**: 적에게 튕기는 연쇄 공격

---

## 🕹️ 조작법

| 동작 | 설명 |
|:---|:---|
| **좌클릭 (상점)** | 유물 구매 및 자동 배치 |
| **드래그 (그리드)** | 유물 위치 이동 |
| **우클릭 (그리드)** | 유물 판매 (삭제) |
| **R 키** | 유물 회전 |
| **마우스 오버** | 상세 정보 확인 |

---

## � 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/netter36/RelicDefense.git
cd RelicDefense

# 간단한 HTTP 서버 실행
python -m http.server 8000

# 브라우저에서 열기
# http://localhost:8000
```

---

## 🛠️ 기술 스택

- **Phaser 3** - 게임 엔진
- **Vanilla JavaScript** - 모듈화된 시스템 아키텍처
- **HTML5 Canvas** - 렌더링
- **CSS3** - UI 스타일링

### 프로젝트 구조

```
js/
├── systems/
│   ├── GridSystem.js      # 그리드 & 시너지 관리
│   ├── TowerSystem.js     # 전투 로직
│   ├── EnemySystem.js     # 적 스폰 & AI
│   ├── UIManager.js       # UI 업데이트
│   └── InputSystem.js     # 입력 처리
├── items.js               # 유물 데이터
├── constants.js           # 게임 상수
└── main.js                # 진입점
```

---

## 📝 라이선스

MIT License

---

## 🎮 지금 플레이하기!

**[https://netter36.github.io/RelicDefense/](https://netter36.github.io/RelicDefense/)**

---

*Created with ❤️ for strategy game enthusiasts*
