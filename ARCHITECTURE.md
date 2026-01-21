# 티켓 상태 관리 시스템 아키텍처

## 개요
이 문서는 React 기반 티켓 관리 시스템의 효율적인 상태 관리 시스템 구현에 대해 설명합니다. 티켓은 생성부터 해결까지 특정 생애주기를 가지며, 시간 기반 자동 전환과 의사결정 기반 종료 로직을 포함합니다.

## 핵심 개념

### 상태 분류
티켓은 다음과 같은 카테고리로 분류됩니다:

- **Active (진행 중)**: 이슈 제기, 배정됨, 처리중, 검증중, 검토중
- **Pending (지연/논의)**: 회의 예정, 보류, 차단됨
- **Terminal (종료)**: 해결됨, 내재화 완료, 취소됨

### 비즈니스 규칙

#### Deadline 규칙
- 티켓 등록 후 7일 이내에 '종료' 상태로 전환되지 않으면 자동으로 '회의 예정' 상태로 이동
- 7일 경과 시 UI에서 '지연됨' 배지를 표시

#### Completion Point
- 티켓의 '완료' 시점은 Terminal 그룹 상태로 변경된 순간
- Meeting Logic: '회의 예정'에서 해결된 티켓도 '완료 티켓 게시판'으로 이동

## 아키텍처 구성

### 1. 상태 상수 및 타입 정의 (`src/constants/ticket.ts`)

```typescript
export const TicketStatus = {
  ISSUE_RAISED: 'ISSUE_RAISED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  VERIFYING: 'VERIFYING',
  REVIEWING: 'REVIEWING',
  MEETING_SCHEDULED: 'MEETING_SCHEDULED',
  ON_HOLD: 'ON_HOLD',
  BLOCKED: 'BLOCKED',
  RESOLVED: 'RESOLVED',
  INTERNALIZED: 'INTERNALIZED',
  CANCELLED: 'CANCELLED',
} as const

export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus]

export const TICKET_STATUS_CATEGORIES: Record<TicketStatusCategory, TicketStatusType[]> = {
  PROGRESS: [/* 진행 상태들 */],
  PENDING: [/* 논의 상태들 */],
  CLOSED: [/* 종료 상태들 */],
}

export function isTerminalState(status: TicketStatusType): boolean
export function getStatusCategory(status: TicketStatusType): TicketStatusCategory
```

### 2. 비즈니스 로직 유틸리티 (`src/utils/ticket.ts`)

```typescript
import { differenceInDays } from 'date-fns'

export function isOverdue(createdAt: Date, days: number = 7): boolean
export function validateStatusTransition(from: TicketStatusType, to: TicketStatusType, comment?: string): { valid: boolean; message?: string }
export function shouldAutoMoveToMeeting(createdAt: Date, currentStatus: TicketStatusType): boolean
```

### 3. 상태 변경 컴포넌트 (`src/components/TicketStatusSTX.tsx`)

#### 특징
- **그룹별 배치**: PROGRESS → PENDING → CLOSED 순서로 시각적 구분
- **코멘트 모달**: PENDING → CLOSED 전환 시 사유 입력 요구
- **즉시 피드백**: Toast 알림으로 상태 변경 결과 표시

#### UI 레이아웃
```tsx
// 상단: 진행 상태 그룹
<StatusSection title="진행 상태" statuses={PROGRESS_STATUSES} />

// 중단: 논의 및 지연 상태 (강조 표시)
<StatusSection 
  title="논의 및 지연 상태" 
  statuses={PENDING_STATUSES} 
  className="bg-yellow-50 border border-yellow-200 rounded-md p-4" 
/>

// 하단: 종료 상태 (명확한 구분)
<div className="border-t border-gray-300 pt-6">
  <StatusSection title="종료 상태" statuses={CLOSED_STATUSES} />
</div>
```

### 4. 데이터 흐름 통합

#### TanStack Query Mutations (`src/lib/mutations.ts`)
```typescript
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, status, comment }) => { /* API 호출 */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('상태가 성공적으로 변경되었습니다.')
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.')
    },
  })
}
```

#### Redux 상태 관리 (`src/store/store.ts`, `src/features/auth/authSlice.ts`)
- 인증 상태 관리
- UI 상태 중앙화

## 구현된 기능

### ✅ 상태 전이 관리
- 유효성 검증 로직
- 상태별 전환 규칙 적용
- 코멘트 요구사항 처리

### ✅ 시간 기반 자동화
- 7일 경과 감지
- Overdue 배지 표시 (5일: 경고, 7일: 위험)
- 자동 상태 전환 로직

### ✅ 사용자 경험
- 그룹별 시각적 배치
- 실시간 상태 표시
- 피드백 알림 시스템

### ✅ 데이터 일관성
- 낙관적 업데이트
- 캐시 무효화
- 에러 처리 및 롤백

## 기술 스택

- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **TanStack Query**: 서버 상태 관리 및 캐싱
- **Redux Toolkit**: 클라이언트 상태 관리
- **React Toastify**: 사용자 알림
- **Tailwind CSS**: 스타일링
- **date-fns**: 날짜 계산

## 사용 예시

```tsx
// 컴포넌트에서 사용
<TicketStatusSTX
  ticketId="ticket-123"
  currentStatus={TicketStatus.IN_PROGRESS}
  disabled={false}
/>

// 상태 변경 시 자동으로:
// 1. 유효성 검증
// 2. 코멘트 모달 표시 (필요시)
// 3. API 호출 및 캐시 업데이트
// 4. 성공/실패 알림 표시
```

## 확장성

시스템은 다음과 같이 쉽게 확장 가능합니다:

- **새로운 상태 추가**: `constants/ticket.ts`에 정의
- **새로운 전환 규칙**: `utils/ticket.ts`에 로직 추가
- **새로운 UI 컴포넌트**: `components/`에 추가
- **새로운 API 엔드포인트**: `lib/mutations.ts`에 추가

이 아키텍처는 티켓 관리의 복잡한 비즈니스 로직을 체계적으로 관리하면서도, 유지보수성과 확장성을 동시에 확보합니다.