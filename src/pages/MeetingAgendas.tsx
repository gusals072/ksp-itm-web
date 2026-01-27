import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Priority, IssueStatus, RankLevel } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDaysSinceCreation } from '../utils/ticket';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard } from 'swiper/modules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import IssueDetailModal from '../components/IssueDetailModal';



// 안건 카드 컴포넌트
const AgendaCard: React.FC<{
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex flex-col">
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {getPriorityText(ticket.priority)}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
      </div>

      {/* 제목 */}
      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{ticket.title}</h3>

      {/* 설명 */}
      <div className="flex-1 mb-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{ticket.description}</p>
      </div>

      {/* 첨언 표시 */}
      {agenda?.notes && (
        <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-purple-700 mb-1">회의 안건 첨언</p>
          <p className="text-sm text-purple-900 line-clamp-2">{agenda.notes}</p>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{daysSinceCreation}일 경과</span>
        </div>
        <div className="flex items-center text-xs">
          <span>등록자: {ticket.reporterName}</span>
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(ticket.createdAt), 'yyyy-MM-dd', { locale: ko })}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onDetail(ticket.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <FileText className="w-3 h-3" />
          상세보기
        </button>
        <button
          onClick={() => onComplete(ticket.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <CheckCircle2 className="w-3 h-3" />
          완료
        </button>
      </div>
    </div>
  );
};



// Swiper 뷰 컴포넌트
const SwiperView: React.FC<{
  tickets: any[];
  meetingAgendas: any[];
  onComplete: (ticketId: string) => void;
  onDetail: (ticketId: string) => void;
  getPriorityColor: (priority: Priority) => string;
  getPriorityText: (priority: Priority) => string;
  onSlideChange?: (index: number) => void;
}> = ({ tickets, meetingAgendas, onComplete, onDetail, getPriorityColor, getPriorityText, onSlideChange }) => {
  const isSingleSlide = tickets.length === 1;
  
  return (
    <div className={`relative flex items-center justify-center w-full ${isSingleSlide ? 'max-w-md mx-auto' : ''}`}>
      <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        modules={[Pagination, Keyboard]}
        className={`meeting-swiper ${isSingleSlide ? '!w-full max-w-md' : ''}`}
        speed={600}
        spaceBetween={30}
        slidesPerView={isSingleSlide ? 1 : 1.2}
        centeredSlides={!isSingleSlide}
        grabCursor={!isSingleSlide}
        onSlideChange={(swiper) => {
          if (onSlideChange) {
            onSlideChange(swiper.activeIndex);
          }
        }}
      >
        {tickets.map((ticket, index) => (
          <SwiperSlide key={ticket.id}>
            <AgendaCard
              ticket={ticket}
              agenda={meetingAgendas.find(a => a.issueId === ticket.id)}
              onComplete={onComplete}
              onDetail={onDetail}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
              index={index}
            />
          </SwiperSlide>
        ))}
      </Swiper>
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
  const meetingTickets = issues.filter(issue => {
    if (removedTicketIds.has(issue.id)) return false;
    if (issue.status !== IssueStatus.MEETING) return false;
    return canViewMeetingAgenda(issue);
  });

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
    <motion.div
      className="p-6 max-w-6xl mx-auto min-h-screen flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 헤더 */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            회의 안건
          </h1>
          <p className="text-gray-600 mt-2">회의가 필요한 안건 또는 2주 이상 해결되지 않은 티켓들이 자동으로 이동되었습니다.</p>
        </div>
      </motion.div>

      {/* 컨텐츠 영역 - Swiper 슬라이드 뷰 */}
      {meetingTickets.length > 0 ? (
        <div className="relative flex-1 flex flex-col justify-center">
          <SwiperView
            tickets={meetingTickets}
            meetingAgendas={meetingAgendas}
            onComplete={handleComplete}
            onDetail={handleDetail}
            getPriorityColor={getPriorityColor}
            getPriorityText={getPriorityText}
            onSlideChange={setCurrentSlideIndex}
          />
          
          {/* 라디오버튼 스타일 인디케이터 */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {meetingTickets.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`안건 ${index + 1}`}
              />
            ))}
          </div>
          
          {/* 안내 텍스트 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              ← 슬라이드하거나 키보드 방향키로 안건을 확인할 수 있습니다 →
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">회의 안건이 없습니다</h3>
          <p className="text-gray-500">현재 진행 중인 티켓들 중 7일이 경과한 티켓이 없습니다.</p>
        </motion.div>
      )}

      {/* 완료 확인 모달 (주간 회의 안건은 사유 없이 바로 완료) */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-[450px] z-[10005]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">ㅇㅇ
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
              className="px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-medium flex items-center gap-2"
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
    </motion.div>
  );
};

export default MeetingAgendas;