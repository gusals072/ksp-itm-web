import React, { useState, useMemo, useEffect } from 'react'
import { useAssignTicket } from '../lib/mutations'
import { useApp } from '../context/AppContext'
import { Search, X, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'

interface Assignee {
  id: string
  name: string
}

interface CCUser extends Assignee {
  isTeam?: boolean // 팀인지 개인인지 구분
  teamName?: string // 팀 이름 (팀인 경우)
  memberCount?: number // 팀 멤버 수
}

interface AssigneeAssignmentProps {
  ticketId: string
  currentAssignee: Assignee | null
  currentCC: Array<{ id: string; name: string }>
  onAssignmentChange: (assignee: Assignee | null, cc: Array<{ id: string; name: string }>) => void
  isOpen: boolean
  onClose: () => void
  allowAssigneeChange?: boolean // 담당자 변경 허용 여부 (기본값: true)
}

export function AssigneeAssignment({
  ticketId,
  currentAssignee,
  currentCC,
  onAssignmentChange,
  isOpen,
  onClose,
  allowAssigneeChange = true
}: AssigneeAssignmentProps) {
  const assignTicketMutation = useAssignTicket()
  const { users } = useApp()
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentAssignee?.id || '')
  const [selectedCC, setSelectedCC] = useState<CCUser[]>(() => {
    // 기존 CC를 CCUser 형태로 변환
    return currentCC.map(cc => ({ id: cc.id, name: cc.name }))
  })
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'개인' | '조직'>('조직')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // 모달이 열릴 때마다 currentAssignee와 currentCC로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedAssignee(currentAssignee?.id || '')
      // 기존 CC를 CCUser 형태로 변환
      setSelectedCC(currentCC.map(cc => ({ id: cc.id, name: cc.name })))
      setSelectedTeams(new Set())
      setSearchQuery('')
      setSelectedTeam(null)
    }
  }, [isOpen, currentAssignee, currentCC])

  // 팀 목록 추출 (department 기반)
  const teams = useMemo(() => {
    const teamSet = new Set<string>()
    users.forEach(user => {
      if (user.department) {
        teamSet.add(user.department)
      }
    })
    return Array.from(teamSet).sort()
  }, [users])

  // 특정 팀의 모든 멤버 가져오기
  const getTeamMembers = (teamName: string) => {
    return users.filter(user => user.department === teamName)
  }

  // 선택된 팀의 멤버 목록
  const teamMembers = useMemo(() => {
    if (!selectedTeam) return []
    return getTeamMembers(selectedTeam)
  }, [selectedTeam, users])

  // 검색 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  // 선택된 항목 총 개수
  const totalSelectedCount = useMemo(() => {
    let count = 0
    selectedCC.forEach(cc => {
      if (cc.isTeam && cc.memberCount) {
        count += cc.memberCount
      } else {
        count += 1
      }
    })
    return count
  }, [selectedCC])

  const handleAddCCUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && !selectedCC.find(cc => cc.id === userId && !cc.isTeam)) {
      setSelectedCC([...selectedCC, { id: user.id, name: user.name }])
    }
  }

  const handleAddTeam = (teamName: string) => {
    const teamMembers = getTeamMembers(teamName)
    if (teamMembers.length === 0) return

    // 이미 추가된 팀인지 확인
    const existingTeam = selectedCC.find(cc => cc.isTeam && cc.teamName === teamName)
    if (existingTeam) return

    // 팀을 CC에 추가 (팀 표시용)
    setSelectedCC([...selectedCC, {
      id: `team-${teamName}`,
      name: teamName,
      isTeam: true,
      teamName: teamName,
      memberCount: teamMembers.length
    }])
    setSelectedTeams(new Set([...selectedTeams, teamName]))
  }

  const handleRemoveCC = (ccId: string) => {
    const cc = selectedCC.find(c => c.id === ccId)
    if (cc?.isTeam && cc.teamName) {
      setSelectedTeams(prev => {
        const newSet = new Set(prev)
        newSet.delete(cc.teamName!)
        return newSet
      })
    }
    setSelectedCC(selectedCC.filter(cc => cc.id !== ccId))
  }

  const handleSave = () => {
    // 팀의 모든 멤버를 개별 CC로 변환
    const finalCC: Array<{ id: string; name: string }> = []
    
    selectedCC.forEach(cc => {
      if (cc.isTeam && cc.teamName) {
        // 팀인 경우 모든 멤버를 개별적으로 추가
        const members = getTeamMembers(cc.teamName)
        members.forEach(member => {
          if (!finalCC.find(c => c.id === member.id)) {
            finalCC.push({ id: member.id, name: member.name })
          }
        })
      } else {
        // 개인인 경우
        if (!finalCC.find(c => c.id === cc.id)) {
          finalCC.push({ id: cc.id, name: cc.name })
        }
      }
    })

    assignTicketMutation.mutate({
      ticketId,
      assigneeId: undefined,
      assigneeName: undefined,
      cc: finalCC
    }, {
      onSuccess: () => {
        onAssignmentChange(null, finalCC)
        onClose()
      }
    })
  }

  const handleCancel = () => {
    setSelectedAssignee(currentAssignee?.id || '')
    setSelectedCC(currentCC.map(cc => ({ id: cc.id, name: cc.name })))
    setSelectedTeams(new Set())
    setSearchQuery('')
    setSelectedTeam(null)
    onClose()
  }

  const handleRefresh = () => {
    // 선택된 항목을 초기 상태로 리셋
    setSelectedAssignee(currentAssignee?.id || '')
    setSelectedCC(currentCC.map(cc => ({ id: cc.id, name: cc.name })))
    setSelectedTeams(new Set())
    setSearchQuery('')
    setSelectedTeam(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[80vh] flex flex-col p-0" hideClose>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
            <DialogTitle className="text-xl font-semibold">주소록</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-600">
                참조자를 선택하세요.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">선택 {totalSelectedCount}</span>
              <button 
                onClick={handleRefresh}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* 왼쪽 패널 */}
          <div className="w-1/2 border-r flex flex-col">
            {/* 탭 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('개인')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === '개인'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                개인
              </button>
              <button
                onClick={() => setActiveTab('조직')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === '조직'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                조직
              </button>
            </div>

            {/* 검색 바 */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름, 메일 주소, 그룹 입력"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === '조직' ? (
                <div className="flex h-full">
                  {/* 팀 목록 */}
                  <div className="w-1/3 border-r p-4 overflow-y-auto">
                    <div className="space-y-1">
                      {teams.map(team => (
                        <button
                          key={team}
                          onClick={() => setSelectedTeam(team)}
                          className={`w-full text-left px-3 py-2 rounded text-sm ${
                            selectedTeam === team
                              ? 'bg-gray-100 text-blue-600 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {team}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 선택된 팀의 멤버 목록 */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {selectedTeam && (
                      <>
                        {/* 팀 전체 선택 */}
                        <div className="mb-4 pb-4 border-b">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTeams.has(selectedTeam)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleAddTeam(selectedTeam)
                                } else {
                                  const teamCC = selectedCC.find(cc => cc.isTeam && cc.teamName === selectedTeam)
                                  if (teamCC) {
                                    handleRemoveCC(teamCC.id)
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">
                              {selectedTeam} {teamMembers.length}
                            </span>
                          </label>
                        </div>

                        {/* 개별 멤버 목록 */}
                        <div className="space-y-2">
                          {teamMembers.map(member => (
                            <label
                              key={member.id}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCC.some(cc => cc.id === member.id && !cc.isTeam)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                      handleAddCCUser(member.id)
                                    } else {
                                      handleRemoveCC(member.id)
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{member.name}</div>
                                <div className="text-xs text-gray-500">
                                  {member.email} · {member.department}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                    {!selectedTeam && (
                      <div className="text-center text-gray-400 py-8">
                        왼쪽에서 팀을 선택하세요
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 개인 탭 - 검색 결과 */
                <div className="p-4">
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCC.some(cc => cc.id === user.id && !cc.isTeam)}
                          onChange={(e) => {
                            if (e.target.checked) {
                                handleAddCCUser(user.id)
                              } else {
                                handleRemoveCC(user.id)
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.email} · {user.department}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽 패널 - 선택된 항목 */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              {/* 참조 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">참조 &gt;</h3>
                </div>
                {selectedCC.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCC.map(cc => (
                      <div
                        key={cc.id}
                        className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {cc.isTeam ? `#${cc.teamName}` : cc.name}
                          </div>
                          {!cc.isTeam && (
                            <div className="text-xs text-gray-500">
                              {users.find(u => u.id === cc.id)?.email}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveCC(cc.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">참조자가 없습니다</div>
                )}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="border-t p-4 flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={assignTicketMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignTicketMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
