import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Priority, IssueStatus, RankLevel } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, FileText, Clock, Search, Filter, ArrowUpDown, X, User, Paperclip, Link as LinkIcon, Tag, ExternalLink, ArrowLeft } from 'lucide-react';
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
  isSelected: boolean;
  onClick: () => void;
  getPriorityColor: (priority: Priority) => string;
  getPriorityText: (priority: Priority) => string;
  index: number;
}> = ({ ticket, isSelected, onClick, getPriorityColor, getPriorityText, index }) => {
      return (
    <div
      onClick={onClick}
      className={`p-3 md:p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${getPriorityColor(ticket.priority)}`} />
        <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex-shrink-0">
          {getPriorityText(ticket.priority)}
        </span>
      </div>
      <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">{ticket.title}</h3>
    </div>
  );
};

// 상세 뷰 컴포넌트
const DetailView: React.FC<{
  ticket: any;
  agenda: any;
  onComplete: (ticketId: string) => void;
  onViewDetail?: (ticketId: string) => void;
  getPriorityColor: (priority: Priority) => string;
  getPriorityText: (priority: Priority) => string;
  index: number;
}> = ({ ticket, agenda, onComplete, onViewDetail, getPriorityColor, getPriorityText, index }) => {
  const daysSinceCreation = getDaysSinceCreation(new Date(ticket.createdAt));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 스크롤 영역: 헤더 ~ 회의 안건 첨언 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-3 md:pb-4 mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap">
          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-medium">
            {getPriorityText(ticket.priority)}
          </span>
          <span className="text-xs md:text-sm text-gray-500 font-medium">#{index + 1}</span>
        </div>
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{ticket.title}</h2>
      </div>

      {/* 기본 정보 */}
      <div className="mb-4 md:mb-5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">기본 정보</h3>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">등록자:</span>
            <span className="text-gray-800 font-medium truncate">{ticket.reporterName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">생성일:</span>
            <span className="text-gray-800">{format(new Date(ticket.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">경과일:</span>
            <span className="text-gray-800 font-medium">{daysSinceCreation}일</span>
          </div>
          {ticket.category && (
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gray-600">카테고리:</span>
              <span className="text-gray-800 font-medium truncate">{ticket.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-4 md:mb-5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">설명</h3>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* 참조자 */}
      {ticket.cc && ticket.cc.length > 0 && (
        <div className="mb-4 md:mb-5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">참조자</h3>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {ticket.cc.map((cc: any) => (
                <span
                  key={cc.id}
                  className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm"
                >
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{cc.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 첨부 파일 */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="mb-4 md:mb-5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">첨부 파일</h3>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="space-y-1.5 md:space-y-2">
              {ticket.attachments.map((attachment: any) => (
                <div key={attachment.id} className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
                  <Paperclip className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate flex-1 min-w-0">{attachment.name}</span>
                  {attachment.size && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 연관 이슈 */}
      {ticket.relatedIssues && ticket.relatedIssues.length > 0 && (
        <div className="mb-4 md:mb-5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">연관 이슈</h3>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="space-y-1.5 md:space-y-2">
              {ticket.relatedIssues.map((relatedIssueId: string) => {
                // 실제로는 issues 배열에서 찾아야 하지만, 여기서는 ID만 표시
                return (
                  <div key={relatedIssueId} className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
                    <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">이슈 ID: {relatedIssueId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 회의 안건 첨언 */}
      {agenda?.notes && (
        <div className="mb-4 md:mb-5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">회의 안건 첨언</h3>
          <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">{agenda.notes}</p>
          </div>
          {agenda?.meetingDate && (
            <p className="text-xs text-gray-500 mt-2">
              등록일: {format(new Date(agenda.meetingDate), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
            </p>
          )}
        </div>
      )}

      </div>

      {/* 상세보기 / 완료 버튼 (하단 고정) */}
      <div className="flex-shrink-0 pt-4 md:pt-5 border-t border-gray-200 bg-gray-50 space-y-2">
        {onViewDetail && (
          <button
            type="button"
            onClick={() => onViewDetail(ticket.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
            상세보기
          </button>
        )}
        <button
          onClick={() => onComplete(ticket.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
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

  // 권한 체크 함수: super_admin 또는 참조자 또는 대표급 이상만 조회 가능
  const canViewMeetingAgenda = (issue: any) => {
    if (!user) return false;
    
    // 총괄 관리자는 모든 티켓 조회 가능
    if (user.role === 'super_admin') return true;
    
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

  // 좁은 화면( md 미만 ) 여부 — 좁을 땐 목록부터 보이도록 자동 선택 안 함
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    typeof window !== 'undefined' ? !window.matchMedia('(min-width: 768px)').matches : true
  );
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = () => setIsNarrowViewport(!mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // 넓은 화면에서만 첫 번째 아이템 자동 선택. 좁은 화면에서는 목록만 보이게 시작
  useEffect(() => {
    if (isNarrowViewport) {
      // 좁은 화면: 자동 선택만 하지 않음. 선택된 아이템이 목록에서 빠졌을 때만 해제
      if (selectedId && !filteredAndSortedTickets.find(t => t.id === selectedId)) {
        setSelectedId(null);
      }
      return;
    }
    if (!selectedId && filteredAndSortedTickets.length > 0) {
      setSelectedId(filteredAndSortedTickets[0].id);
    } else if (selectedId && !filteredAndSortedTickets.find(t => t.id === selectedId)) {
      setSelectedId(filteredAndSortedTickets.length > 0 ? filteredAndSortedTickets[0].id : null);
    }
  }, [filteredAndSortedTickets, selectedId, isNarrowViewport]);

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
    <div className="flex flex-col bg-gray-50 h-screen max-h-[90vh] my-2 md:my-4 mx-2 md:mx-4 rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}

      {/* 메인 컨텐츠 영역 - 듀얼 패널 (좁은 화면에서도 좌측 목록 유지) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 min-w-0">
        {/* 왼쪽 패널 - 리스트 뷰: 최소 너비 보장으로 md 구간에서 사라지지 않음 */}
        <div className="w-full min-w-0 flex-1 flex flex-col min-h-0 md:min-h-0 md:flex-shrink-0 md:min-w-[260px] md:w-1/2 lg:w-2/5 xl:w-1/3 md:border-r border-b md:border-b-0 border-gray-200 bg-white">
          {/* 검색 및 필터 영역 */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            {/* 검색창 */}
            <div className="relative mb-2 md:mb-3">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 md:pl-10 pr-7 md:pr-9 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs md:text-sm"
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
            <div className="flex items-center gap-1.5 md:gap-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'title')}
                className="flex-1 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="date">날짜순</option>
                <option value="priority">우선순위순</option>
                <option value="title">제목순</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 md:p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title={sortOrder === 'asc' ? '내림차순' : '오름차순'}
              >
                <ArrowUpDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 리스트 영역 */}
          <div className="flex-1 overflow-y-auto">
            {filteredAndSortedTickets.length > 0 ? (
              filteredAndSortedTickets.map((ticket, index) => {
                return (
                  <AgendaListItem
                    key={ticket.id}
                    ticket={ticket}
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

        {/* 오른쪽 패널 - 상세 뷰 (md 이상에서만 나란히 표시) */}
        <div className="flex-1 min-w-0 bg-gray-50 hidden md:flex overflow-hidden min-h-0">
          {selectedTicket ? (
            <div className="w-full p-4 md:p-6 flex flex-col min-h-0">
              <DetailView
                ticket={selectedTicket}
                agenda={selectedAgenda}
                onComplete={handleComplete}
                onViewDetail={(ticketId) => {
                  setSelectedIssueId(ticketId);
                  setIsModalOpen(true);
                }}
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

        {/* 모바일 상세 뷰 (전체 화면 오버레이, 사이드바/헤더 위에 표시해 버튼 클릭 가능) */}
        {selectedTicket && (
          <div className="md:hidden fixed inset-0 bg-white z-[80] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-3 flex items-center gap-2">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1.5 p-2 -ml-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 flex-shrink-0"
                aria-label="목록으로 돌아가기"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">목록</span>
              </button>
              <h2 className="text-sm font-semibold text-gray-800 truncate flex-1 min-w-0">{selectedTicket.title}</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <DetailView
                ticket={selectedTicket}
                agenda={selectedAgenda}
                onComplete={handleComplete}
                onViewDetail={(ticketId) => {
                  setSelectedIssueId(ticketId);
                  setIsModalOpen(true);
                }}
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