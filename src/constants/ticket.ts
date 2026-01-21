export const TicketStatus = {
  ISSUE_RAISED: 'ISSUE_RAISED', // 이슈 제기 (생성 직후)
  IN_PROGRESS: 'IN_PROGRESS', // 처리중 (담당자 배정 후)
  MEETING_SCHEDULED: 'MEETING_SCHEDULED', // 회의 예정 (7일 경과 시)
  RESOLVED: 'RESOLVED', // 완료됨 (최종 상태)
} as const

export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus]

export type TicketStatusCategory = 'PROGRESS' | 'PENDING' | 'CLOSED';

export const TICKET_STATUS_CATEGORIES: Record<TicketStatusCategory, TicketStatusType[]> = {
  PROGRESS: [
    TicketStatus.ISSUE_RAISED as TicketStatusType,
    TicketStatus.IN_PROGRESS as TicketStatusType,
  ],
  PENDING: [
    TicketStatus.MEETING_SCHEDULED as TicketStatusType,
  ],
  CLOSED: [
    TicketStatus.RESOLVED as TicketStatusType,
  ],
};

export function getStatusCategory(status: TicketStatusType): TicketStatusCategory {
  for (const [category, statuses] of Object.entries(TICKET_STATUS_CATEGORIES)) {
    if (statuses.includes(status)) {
      return category as TicketStatusCategory;
    }
  }
  throw new Error(`Unknown status: ${status}`);
}

export function isTerminalState(status: TicketStatusType): boolean {
  return TICKET_STATUS_CATEGORIES.CLOSED.includes(status);
}

// 한국어 라벨
export const TICKET_STATUS_LABELS: Record<TicketStatusType, string> = {
  [TicketStatus.ISSUE_RAISED]: '이슈 제기',
  [TicketStatus.IN_PROGRESS]: '처리중',
  [TicketStatus.MEETING_SCHEDULED]: '회의 예정',
  [TicketStatus.RESOLVED]: '완료됨',
};

// 상태 변경 시 코멘트가 필요한 경우 (회의에서 완료할 때)
export const REQUIRES_COMMENT_ON_CLOSE: TicketStatusType[] = [
  TicketStatus.MEETING_SCHEDULED as TicketStatusType,
];