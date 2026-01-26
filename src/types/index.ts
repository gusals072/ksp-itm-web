// 이슈 상태 타입
export type IssueStatus = 
  | 'PENDING'        // 이슈 제기
  | 'IN_PROGRESS'    // 처리 중
  | 'MEETING'        // 회의 예정
  | 'RESOLVED';      // 완료됨

// 이슈 상태 상수
export const IssueStatus = {
  PENDING: 'PENDING' as IssueStatus,
  IN_PROGRESS: 'IN_PROGRESS' as IssueStatus,
  MEETING: 'MEETING' as IssueStatus,
  RESOLVED: 'RESOLVED' as IssueStatus
} as const;

// 우선순위 타입
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// 우선순위 상수
export const Priority = {
  LOW: 'LOW' as Priority,
  MEDIUM: 'MEDIUM' as Priority,
  HIGH: 'HIGH' as Priority,
  URGENT: 'URGENT' as Priority
} as const;

// 직급 타입
export type Rank =
  | 'SAWON'      // 사원
  | 'JUIM'       // 주임
  | 'DAERI'      // 대리
  | 'GWAJANG'    // 과장
  | 'CHAJANG'    // 차장
  | 'BUJANG'     // 부장
  | 'SANGMU'     // 상무
  | 'ISA'        // 이사
  | 'SILJANG'    // 실장
  | 'DAEPIO';    // 대표

// 직급 상수
export const Rank = {
  SAWON: 'SAWON' as Rank,
  JUIM: 'JUIM' as Rank,
  DAERI: 'DAERI' as Rank,
  GWAJANG: 'GWAJANG' as Rank,
  CHAJANG: 'CHAJANG' as Rank,
  BUJANG: 'BUJANG' as Rank,
  SANGMU: 'SANGMU' as Rank,
  ISA: 'ISA' as Rank,
  SILJANG: 'SILJANG' as Rank,
  DAEPIO: 'DAEPIO' as Rank
} as const;

// 직급 한글명 매핑
export const RankLabel: Record<Rank, string> = {
  SAWON: '사원',
  JUIM: '주임',
  DAERI: '대리',
  GWAJANG: '과장',
  CHAJANG: '차장',
  BUJANG: '부장',
  SANGMU: '상무',
  ISA: '이사',
  SILJANG: '실장',
  DAEPIO: '대표'
};

// 직급 레벨 (높을수록 높은 직급)
export const RankLevel: Record<Rank, number> = {
  SAWON: 1,
  JUIM: 2,
  DAERI: 3,
  GWAJANG: 4,
  CHAJANG: 5,
  BUJANG: 6,
  SANGMU: 7,
  ISA: 8,
  SILJANG: 9,
  DAEPIO: 10
};

// 사용자 타입
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'manager' | 'user';
  rank: Rank;
}

// 이슈 타입
export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  cc?: Array<{          // 참조 인원
    id: string;
    name: string;
  }>;
  readLevel: Rank;       // 열람 권한 (이 직급 이상만 볼 수 있음)
  createdAt: Date;
  updatedAt: Date;
  meetingDate?: Date;      // 주간 회의 예정일
  resolvedDate?: Date;     // 완료일
  internalizedDate?: Date; // 내재화 완료일
  tags: string[];
  category: string;
  relatedIssues?: string[]; // 연관된 이슈 ID 목록
  attachments?: Array<{ // 첨부 파일
    id: string;
    name: string;
    size: number; // 바이트 단위
    type: string; // MIME 타입
    url?: string; // 파일 다운로드 URL (선택)
  }>;
}

// 회의 안건 타입
export interface MeetingAgenda {
  id: string;
  issueId: string;
  issueTitle: string;
  status: 'pending' | 'discussed' | 'resolved';
  meetingDate: Date;
  notes?: string;
}

// 내재화 검토 타입
export interface Internalization {
  id: string;
  issueId: string;
  issueTitle: string;
  reviewDate: Date;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

// 완료된 티켓 보관 타입 (종료된 이슈 및 회의 안건의 이력 관리)
export interface ClosedTicket {
  id: string;
  issueId: string;
  issueTitle: string;
  issueDescription: string;
  finalStatus: IssueStatus; // 최종 상태 (RESOLVED)
  closedDate: Date; // 종료 일자
  closedReason?: string; // 종료 사유 (완료 방법)
  source: 'issue' | 'meeting'; // 출처: 이슈 목록에서 직접 종료 or 주간 회의 안건에서 종료
  // 원본 이슈 정보
  priority: Priority;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  cc?: Array<{
    id: string;
    name: string;
  }>;
  category: string;
  tags: string[];
  createdAt: Date; // 원본 이슈 생성일
  // 회의 안건 관련 정보 (source가 'meeting'인 경우)
  meetingAgendaId?: string;
  meetingDate?: Date;
}

// 로그인 폼 타입
export interface LoginForm {
  username: string;
  password: string;
}

// 이슈 생성 폼 타입
export interface CreateIssueForm {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  tags: string[];
}

// 의견 타입
export interface Opinion {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
  }>;
}