import { differenceInDays } from 'date-fns'
import type { TicketStatusType } from '../constants/ticket'

export function isOverdue(createdAt: Date, days: number = 7): boolean {
  return differenceInDays(new Date(), createdAt) >= days
}

export function isCompleted(status: TicketStatusType): boolean {
  return status === 'RESOLVED'
}

// 티켓 생성 후 경과 일수 계산
export function getDaysSinceCreation(createdAt: Date): number {
  return Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
}

// 주기적으로 티켓 상태를 확인하고 자동 전환하는 함수
export function checkAndAutoTransitionTickets(tickets: any[], updateStatus: (id: string, status: any) => void) {
  tickets.forEach(ticket => {
    // IN_PROGRESS 상태이고 7일이 경과한 티켓을 회의 예정으로 전환
    if (ticket.status === 'IN_PROGRESS' && isOverdue(new Date(ticket.createdAt))) {
      console.log(`Auto-transitioning ticket ${ticket.id} to MEETING_SCHEDULED`)
      updateStatus(ticket.id, 'MEETING_SCHEDULED')
    }
  })
}

// 상태 전이 유효성 검증
export function validateStatusTransition(
  fromStatus: TicketStatusType,
  toStatus: TicketStatusType,
  comment?: string
): { valid: boolean; message?: string } {
  // 새로운 상태 전이 규칙:
  // ISSUE_RAISED -> IN_PROGRESS: 담당자 배정 시 자동 전환
  // IN_PROGRESS -> MEETING_SCHEDULED: 7일 경과 시 자동 전환
  // MEETING_SCHEDULED -> RESOLVED: 회의에서 완료 시

  // 유효하지 않은 전이 차단
  const validTransitions: Record<TicketStatusType, TicketStatusType[]> = {
    ISSUE_RAISED: ['IN_PROGRESS'],
    IN_PROGRESS: ['MEETING_SCHEDULED'],
    MEETING_SCHEDULED: ['RESOLVED'],
    RESOLVED: [] // 완료 상태에서는 더 이상 변경 불가
  }

  if (!validTransitions[fromStatus]?.includes(toStatus)) {
    return {
      valid: false,
      message: '유효하지 않은 상태 전이입니다.'
    }
  }

  // 회의에서 완료할 때는 코멘트 필수
  if (fromStatus === 'MEETING_SCHEDULED' && toStatus === 'RESOLVED') {
    if (!comment || comment.trim().length === 0) {
      return {
        valid: false,
        message: '회의에서 완료할 때는 완료 사유를 입력해야 합니다.'
      }
    }
  }

  return { valid: true }
}