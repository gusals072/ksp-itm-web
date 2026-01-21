import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5분 동안 데이터 신선함 유지
      gcTime: 1000 * 60 * 30,    // 30분 동안 캐시 유지
      retry: 3,                  // 실패 시 3번 재시도
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})