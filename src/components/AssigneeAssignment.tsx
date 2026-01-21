import React, { useState } from 'react'
import { useAssignTicket } from '../lib/mutations'

// 더미 사용자 목록
const dummyUsers = [
  { id: '1', name: '김대표', rank: 'DAEPIO' },
  { id: '2', name: '박이사', rank: 'ISA' },
  { id: '3', name: '이상무', rank: 'SANGMU' },
  { id: '4', name: '정부장', rank: 'BUJANG' },
  { id: '5', name: '최차장', rank: 'CHAJANG' },
  { id: '6', name: '한과장', rank: 'GWAJANG' },
  { id: '7', name: '조대리', rank: 'DAERI' },
  { id: '8', name: '권주임', rank: 'JUIM' },
  { id: '9', name: '민사원', rank: 'SAWON' }
]

interface Assignee {
  id: string
  name: string
}

interface CCUser extends Assignee {}

interface AssigneeAssignmentProps {
  ticketId: string
  currentAssignee: Assignee | null
  currentCC: CCUser[]
  onAssignmentChange: (assignee: Assignee | null, cc: CCUser[]) => void
  isModal?: boolean // 모달 형태로 표시할지 여부
}

export function AssigneeAssignment({
  ticketId,
  currentAssignee,
  currentCC,
  onAssignmentChange,
  isModal = false
}: AssigneeAssignmentProps) {
  const assignTicketMutation = useAssignTicket()
  const [isEditing, setIsEditing] = useState(isModal) // 모달인 경우 기본적으로 편집 모드
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentAssignee?.id || '')
  // 모달 형태일 때는 기본적으로 참조자가 없도록 빈 배열로 초기화
  const [selectedCC, setSelectedCC] = useState<CCUser[]>(isModal ? [] : currentCC)

  const handleSave = () => {
    const assignee = selectedAssignee ? dummyUsers.find(u => u.id === selectedAssignee) || null : null

    assignTicketMutation.mutate({
      ticketId,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      cc: selectedCC
    }, {
      onSuccess: () => {
        onAssignmentChange(assignee, selectedCC)
        if (!isModal) {
          setIsEditing(false)
        } else {
          // 모달 형태인 경우 배정 완료 후 모달 닫기 처리는 부모 컴포넌트에서 처리
        }
      }
    })
  }

  const handleCancel = () => {
    setSelectedAssignee(currentAssignee?.id || '')
    setSelectedCC(currentCC)
    setIsEditing(false)
  }

  const handleAddCC = (userId: string) => {
    const user = dummyUsers.find(u => u.id === userId)
    if (user && !selectedCC.find(cc => cc.id === userId)) {
      setSelectedCC([...selectedCC, { id: user.id, name: user.name }])
    }
  }

  const handleRemoveCC = (userId: string) => {
    setSelectedCC(selectedCC.filter(cc => cc.id !== userId))
  }

  // 모달 형태 렌더링
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">담당자 및 참조자 배정</h3>
          <p className="text-sm text-gray-600 mb-6">
            티켓을 진행하려면 담당자를 배정해야 합니다.
            <br />
            <p className="text-xs text-gray-600">
              담당자가 배정되지 않은 티켓은 진행할 수 없습니다.
            </p>
          </p>

          {/* 담당자 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              담당자 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">담당자 선택</option>
              {dummyUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.rank})
                </option>
              ))}
            </select>
          </div>

          {/* 참조자 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">참조자 (선택)</label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCC(e.target.value)
                  e.target.value = ''
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">참조자 추가</option>
              {dummyUsers
                .filter(u => u.id !== selectedAssignee && !selectedCC.find(cc => cc.id === u.id))
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.rank})
                  </option>
                ))}
            </select>
          </div>

          {/* 선택된 참조자 목록 */}
          {selectedCC.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedCC.map((cc) => (
                  <span
                    key={cc.id}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <span>{cc.name}</span>
                    <button
                      onClick={() => handleRemoveCC(cc.id)}
                      className="ml-2 hover:text-blue-900 text-lg leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSave}
              disabled={assignTicketMutation.isPending || !selectedAssignee}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignTicketMutation.isPending ? '배정 중...' : '배정하기'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 일반 형태 렌더링
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">담당자 및 참조자 배정</h3>

        {/* 담당자 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">담당자 선택</option>
            {dummyUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.rank})
              </option>
            ))}
          </select>
        </div>

        {/* 참조자 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">참조자</label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleAddCC(e.target.value)
                e.target.value = ''
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">참조자 추가</option>
            {dummyUsers
              .filter(u => u.id !== selectedAssignee && !selectedCC.find(cc => cc.id === u.id))
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.rank})
                </option>
              ))}
          </select>
        </div>

        {/* 선택된 참조자 목록 */}
        {selectedCC.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedCC.map((cc) => (
                <span
                  key={cc.id}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <span>{cc.name}</span>
                  <button
                    onClick={() => handleRemoveCC(cc.id)}
                    className="ml-2 hover:text-blue-900 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={assignTicketMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">담당자 및 참조자</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          배정하기
        </button>
      </div>

      {/* 담당자 표시 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
          <span className="font-medium">담당자</span>
        </div>
        {currentAssignee ? (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="font-medium">{currentAssignee.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">담당자가 배정되지 않았습니다</span>
        )}
      </div>

      {/* 참조자 표시 */}
      <div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
          <span className="font-medium">참조자 ({currentCC.length})</span>
        </div>
        {currentCC.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {currentCC.map((cc) => (
              <span
                key={cc.id}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                <span>{cc.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">참조자가 없습니다</span>
        )}
      </div>
    </div>
  )
}