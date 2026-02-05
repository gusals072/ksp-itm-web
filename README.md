# K-SMARTPIA 이슈 티켓 매니지먼트 (ksp-itm-web)

케이스마트피아 내부용 **이슈(티켓) 관리 시스템** 프론트엔드입니다. 이슈 생성·배정·상태 관리, 주간 회의 안건, 완료 티켓 내재화, 알림 기능을 제공합니다.

---

## 주요 기능

- **대시보드** – 사용자별 이슈 요약, 캘린더 뷰, 최근/진행 중 이슈
- **이슈 목록** – 필터·정렬·상세 보기·생성·수정
- **회의 안건** – 미해결 이슈를 회의 안건으로 관리, 완료 처리
- **완료된 티켓** – 내재화된 티켓 이력 조회·재오픈
- **알림** – 티켓 생성·상태 변경·의견 추가 알림
- **관리자** – 총괄 관리자 전용: 유저 관리, 사이트 관리

---

## 기술 스택

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 4**, **Radix UI**, **Framer Motion**, **Lucide React**
- **React Router 7**, **React Context**(AppContext), **Redux Toolkit**, **TanStack React Query**

---

## 사용 방법

### 필요 환경

- **Node.js** 18 이상 (LTS 권장)
- **npm** 9 이상

### 설치

```bash
git clone https://github.com/gusals072/ksp-itm-web.git
cd ksp-itm-web
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:5173/ksp-itm-web/** 로 접속합니다.

### 빌드

```bash
npm run build
```

`dist/` 폴더에 프로덕션 빌드가 생성됩니다. 배포 시 서버에서 `/ksp-itm-web/` 경로로 이 빌드 결과를 서빙하면 됩니다.

### 기타 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run preview` | 빌드 결과를 로컬에서 미리 보기 |
| `npm run build:check` | TypeScript 검사 후 빌드 |
| `npm run lint` | ESLint 실행 |

---

## API 연동 (개발 환경)

개발 서버 실행 시 `/api` 요청은 **http://localhost:8080** 으로 프록시됩니다. 백엔드 서버를 8080 포트에서 띄우면 API 연동이 가능합니다.  
실제 백엔드 연동은 `src/lib/mutations.ts`의 `apiCall`을 구현한 뒤 사용하면 됩니다.

---

## 프로젝트 구조 요약

```
src/
├── main.tsx, App.tsx     # 진입점, 라우팅
├── components/            # 공통 컴포넌트 (Header, Sidebar, 모달 등)
├── pages/                 # 페이지 (Dashboard, IssueList, MeetingAgendas 등)
├── context/AppContext.tsx # 전역 상태 (인증, 이슈, 알림 등)
├── lib/                   # API 훅, QueryClient, 유틸
├── store/, features/      # Redux (보조)
├── types/, constants/, utils/
```

프로젝트 구조 상세는 **src/** 폴더와 각 파일 주석을 참고하세요.

---

## 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 GitHub Actions로 빌드 후 **GitHub Pages**에 자동 배포됩니다.  
배포 URL은 `https://<사용자 또는 조직>.github.io/ksp-itm-web/` 형태입니다. (Repository → Settings → Pages에서 확인)

---

## 문의

버그·기능 제안은 [GitHub Issues](https://github.com/gusals072/ksp-itm-web/issues)를 이용해 주세요.
