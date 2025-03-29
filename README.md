# 🍽️ Food Scheduler

맛집 방문 기록을 관리하고 다음 방문을 계획할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🗺️ **네이버 지도 기반 맛집 위치 확인**

  - 커스텀 마커로 맛집 위치 표시
  - 클릭 시 상세 정보 확인 가능
  - 방문 이력 확인 가능

- 📅 **방문 일정 관리**
  - 맛집 방문 이력 기록
  - 다음 방문 일정 계획
  - 방문 히스토리 관리

## 기술 스택

- **Frontend**

  - React
  - TypeScript
  - Material-UI
  - SCSS

- **Maps**

  - Naver Maps API

- **상태 관리**
  - React Context API

## 시작하기

### 환경 설정

1. 환경 변수 설정

```bash
# .env.local 파일 생성
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

2. 의존성 설치

```bash
npm install
```

3. 개발 서버 실행

```bash
npm run dev
```

## 프로젝트 구조

```
src/
├── components/         # 리액트 컴포넌트
│   ├── commons/       # 공통 컴포넌트
│   └── Map.tsx        # 네이버 맵 컴포넌트
├── lib/               # 유틸리티 및 API 관련 코드
│   └── api/          # API 관련 코드
├── data/             # 정적 데이터
│   └── restaurants.json  # 맛집 데이터
├── types/            # TypeScript 타입 정의
└── App.tsx           # 메인 애플리케이션 컴포넌트
```

## 주요 컴포넌트

### Map 컴포넌트

- 네이버 지도 표시
- 커스텀 마커 구현
- 맛집 정보 윈도우 표시
- 방문 이력 표시

### RestaurantCard 컴포넌트

- 맛집 상세 정보 표시
- 방문 일정 등록 기능
- 방문 이력 표시

## 기여하기

1. 이 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다.
3. 변경사항을 커밋합니다.
4. 브랜치에 푸시합니다.
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
