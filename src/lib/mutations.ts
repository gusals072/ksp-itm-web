import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TicketStatusType } from '../constants/ticket'

// API 호출 시뮬레이션 - 실제로는 axios나 fetch 사용
const apiCall = async (url: string, options?: RequestInit) => {
  // 실제 구현에서는 여기에 HTTP 요청 로직 추가
  console.log('API Call:', url, options)
  return Promise.resolve({ success: true })
}

// 티켓 상태 변경 mutation
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, status, comment }: { ticketId: string; status: any; comment?: string }) => {
      // 실제 API 호출
      const response = await apiCall(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment })
      })

      return response
    },
    onSuccess: (_, { ticketId, status }) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })

      toast.success('티켓 상태가 성공적으로 변경되었습니다.')
    },
    onError: (error) => {
      console.error('Status update failed:', error)
    },
  })
}

// 티켓 삭제 mutation
export const useDeleteTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiCall(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      console.error('Delete failed:', error)
      toast.error('티켓 삭제에 실패했습니다.')
    },
  })
}

// 티켓 담당자/참조자 배정 mutation
export const useAssignTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ticketId,
      assigneeId,
      assigneeName,
      cc
    }: {
      ticketId: string;
      assigneeId?: string;
      assigneeName?: string;
      cc?: Array<{ id: string; name: string }>
    }) => {
      const response = await apiCall(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId, assigneeName, cc })
      })
      return response
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    },
    onError: (error) => {
      console.error('Assignment failed:', error)
    },
  })
}

// 티켓 생성 mutation
export const useCreateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await apiCall('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      console.error('Create failed:', error)
    },
  })
}