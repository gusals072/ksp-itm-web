import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Priority, IssueStatus, RankLevel } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, FileText, Clock, Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDaysSinceCreation } from '../utils/ticket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import IssueDetailModal from '../components/IssueDetailModal';

// 리스트 아이템 컴포넌트
const AgendaListItem: React.FC<{
  ticket: any;
  agenda: any;
  isSelected: boolean;
  onClick: () => void;
  getPriorityColor: (priority: Priority) => string;
  getPriorityText: (priority: Priority) => string;
  index: number;
}> = ({ ticket, agenda, isSelected, onClick, getPriorityColor, getPriorityText, index }) => {
  const daysSinceCreation = getDaysSinceCreation(new Date(ticket.createdAt));

  return (
      <div
      onClick={onClick}
      className={`p-5 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityColor(ticket.priority)}`} />
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex-shrink-0">
            {getPriorityText(ticket.priority)}
          </span>
          <span className="text-sm text-gray-500 flex-shrink-0">#{index + 1}</span>
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-1">{ticket.title}</h3>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

      {agenda?.notes && (
        <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs font-medium text-purple-700 mb-1">회의 안건 첨언</p>
          <p className="text-sm text-purple-900 line-clamp-1">{agenda.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{daysSinceCreation}일 경과</span>
        </div>
        <span>{ticket.reporterName}</span>
        <span>{format(new Date(ticket.createdAt), 'yyyy-MM-dd', { locale: ko })}</span>
      </div>
    </div>
  );
};

// 상세 뷰 컴포넌트
const DetailView: React.FC<{
  ticket: any;
  agenda: any;
  onComplete: (ticketId: string) => void;
  onDetail: (ticketId: string) => void;
  getPriorityColor: (priority: Priority) => string;
  getPriorityText: (priority: Priority) => string;
  index: number;
}> = ({ ticket, agenda, onComplete, onDetail, getPriorityColor, getPriorityText, index }) => {
  const daysSinceCreation = getDaysSinceCreation(new Date(ticket.createdAt));

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-4 mb-5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {getPriorityText(ticket.priority)}
          </span>
          <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{ticket.title}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{daysSinceCreation}일 경과</span>
          </div>
          <span>등록자: {ticket.reporterName}</span>
          <span>{format(new Date(ticket.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}</span>
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-5 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">설명</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">{ticket.description}</p>
        </div>
      </div>

      {/* 회의 안건 첨언 */}
      {agenda?.notes && (
        <div className="mb-5 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">회의 안건 첨언</h3>
          <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-4">
            <p className="text-sm text-purple-900 whitespace-pre-wrap line-clamp-3">{agenda.notes}</p>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3 mt-auto pt-5 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => onDetail(ticket.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          상세보기
        </button>
        <button
          onClick={() => onComplete(ticket.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4" />
          완료 처리
        </button>
      </div>
    </div>
  );
};



const MeetingAgendas: React.FC = () => {
  const { issues, updateIssueStatus, meetingAgendas, user } = useApp();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removedTicketIds, setRemovedTicketIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 권한 체크 함수: 참조자 또는 대표급 이상만 조회 가능
  const canViewMeetingAgenda = (issue: any) => {
    if (!user) return false;
    
    // 참조자인지 확인
    const isReferenced = issue.cc?.some((ccUser: any) => ccUser.id === user.id);
    if (isReferenced) return true;
    
    // 대표급 이상인지 확인 (DAEPIO = 10)
    const isRepresentativeOrAbove = RankLevel[user.rank] >= RankLevel.DAEPIO;
    if (isRepresentativeOrAbove) return true;
    
    return false;
  };

  // 회의 예정 상태의 티켓들만 필터링하고 권한 체크
  const meetingTickets = useMemo(() => {
    return issues.filter(issue => {
      if (removedTicketIds.has(issue.id)) return false;
      if (issue.status !== IssueStatus.MEETING) return false;
      return canViewMeetingAgenda(issue);
    });
  }, [issues, removedTicketIds, user]);

  // 검색 및 정렬된 목록
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = meetingTickets.filter(ticket => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.reporterName.toLowerCase().includes(term)
      );
    });

    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { [Priority.URGENT]: 4, [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ko');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [meetingTickets, searchTerm, sortBy, sortOrder]);

  // 선택된 티켓
  const selectedTicket = selectedId ? filteredAndSortedTickets.find(t => t.id === selectedId) : null;
  const selectedAgenda = selectedTicket ? meetingAgendas.find(a => a.issueId === selectedTicket.id) : null;
  const selectedIndex = selectedTicket ? filteredAndSortedTickets.findIndex(t => t.id === selectedId) : -1;

  // 첫 번째 아이템 자동 선택
  useEffect(() => {
    if (!selectedId && filteredAndSortedTickets.length > 0) {
      setSelectedId(filteredAndSortedTickets[0].id);
    } else if (selectedId && !filteredAndSortedTickets.find(t => t.id === selectedId)) {
      // 선택된 아이템이 필터링에서 제외된 경우 첫 번째 아이템 선택
      setSelectedId(filteredAndSortedTickets.length > 0 ? filteredAndSortedTickets[0].id : null);
    }
  }, [filteredAndSortedTickets, selectedId]);

  const handleCompleteConfirm = () => {
    if (!selectedTicketId) {
      return;
    }

    const ticketId = selectedTicketId;
    
    // 모달 닫기
    setShowCompleteModal(false);
    setSelectedTicketId(null);
    
    // 상태 업데이트
    updateIssueStatus(ticketId, IssueStatus.RESOLVED, '');
    
    // 목록에서 제거
    setRemovedTicketIds(prev => new Set(prev).add(ticketId));
    
    // 선택 해제
    if (selectedId === ticketId) {
      setSelectedId(null);
    }
  };

  const handleComplete = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowCompleteModal(true);
  };

  const handleDetail = (ticketId: string) => {
    setSelectedIssueId(ticketId);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return 'bg-red-500';
      case Priority.HIGH:
        return 'bg-orange-500';
      case Priority.MEDIUM:
        return 'bg-yellow-500';
      case Priority.LOW:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return '긴급';
      case Priority.HIGH:
        return '높음';
      case Priority.MEDIUM:
        return '보통';
      case Priority.LOW:
        return '낮음';
      default:
        return priority;
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 h-screen max-h-[90vh] my-4 mx-auto max-w-[1800px] rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}

      {/* 메인 컨텐츠 영역 - 듀얼 패널 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* 왼쪽 패널 - 리스트 뷰 */}
        <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 md:border-r border-b md:border-b-0 border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* 검색 및 필터 영역 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            {/* 검색창 */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'title')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="date">날짜순</option>
                <option value="priority">우선순위순</option>
                <option value="title">제목순</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                title={sortOrder === 'asc' ? '내림차순' : '오름차순'}
              >
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 리스트 영역 */}
          <div className="flex-1 overflow-y-auto">
            {filteredAndSortedTickets.length > 0 ? (
              filteredAndSortedTickets.map((ticket, index) => {
                const agenda = meetingAgendas.find(a => a.issueId === ticket.id);
                return (
                  <AgendaListItem
                    key={ticket.id}
                    ticket={ticket}
                    agenda={agenda}
                    isSelected={selectedId === ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    getPriorityColor={getPriorityColor}
                    getPriorityText={getPriorityText}
                    index={index}
                  />
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">
                  {searchTerm ? '검색 결과가 없습니다.' : '회의 안건이 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 패널 - 상세 뷰 */}
        <div className="flex-1 bg-gray-50 hidden md:flex overflow-hidden">
          {selectedTicket ? (
            <div className="w-full p-6 flex flex-col">
              <DetailView
                ticket={selectedTicket}
                agenda={selectedAgenda}
                onComplete={handleComplete}
                onDetail={handleDetail}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                index={selectedIndex}
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center p-6">
              <div className="text-center text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">항목을 선택해 주세요</p>
                <p className="text-sm text-gray-400 mt-2">왼쪽 목록에서 안건을 선택하면 상세 정보를 확인할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>

        {/* 모바일 상세 뷰 (모달 방식) */}
        {selectedTicket && (
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-800">상세 정보</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <DetailView
                ticket={selectedTicket}
                agenda={selectedAgenda}
                onComplete={handleComplete}
                onDetail={handleDetail}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                index={selectedIndex}
              />
            </div>
          </div>
        )}
      </div>

      {/* 완료 확인 모달 */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-[450px] z-[10005]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              회의 완료 처리
            </DialogTitle>
            <DialogDescription>
              이 티켓을 완료 처리하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                setShowCompleteModal(false);
                setSelectedTicketId(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleCompleteConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              완료하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이슈 상세 모달 */}
      <IssueDetailModal
        issueId={selectedIssueId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIssueId(null);
        }}
        onIssueChange={(newIssueId) => {
          setSelectedIssueId(newIssueId);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};

export default MeetingAgendas;