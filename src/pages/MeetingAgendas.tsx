import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Priority, IssueStatus } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDaysSinceCreation } from '../utils/ticket';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import IssueDetailModal from '../components/IssueDetailModal';

const MeetingAgendas: React.FC = () => {
  const navigate = useNavigate();
  const { issues, updateIssueStatus, meetingAgendas } = useApp();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 회의 예정 상태의 티켓들만 필터링
  const meetingTickets = issues.filter(issue => issue.status === IssueStatus.MEETING);

  const handleCompleteClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = () => {
    if (!selectedTicketId) {
      return;
    }

    // 주간 회의 안건은 사유 없이 바로 완료 처리
    updateIssueStatus(selectedTicketId, IssueStatus.RESOLVED, '');
    setShowCompleteModal(false);
    setSelectedTicketId(null);
  };

  const handleDetailClick = (ticketId: string) => {
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
      className="p-6 max-w-6xl mx-auto"
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
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          회의 안건
        </h1>
        <p className="text-gray-600 mt-2">2주 이상 해결되지 않은 티켓들이 자동으로 이동되었습니다.</p>
      </motion.div>

      {/* 티켓 목록 */}
      {meetingTickets.length > 0 ? (
        <div className="space-y-4">
          {meetingTickets.map((ticket, index) => {
            const daysSinceCreation = getDaysSinceCreation(new Date(ticket.createdAt));

            return (
              <motion.div
                key={ticket.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 제목과 우선순위 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {getPriorityText(ticket.priority)}
                      </span>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                    {/* 첨언 표시 (회의 안건에서만 확인 가능) */}
                    {(() => {
                      const agenda = meetingAgendas.find(a => a.issueId === ticket.id);
                      return agenda?.notes ? (
                        <div className="bg-purple-50 border-l-4 border-purple-400 rounded p-3 mb-3">
                          <p className="text-xs font-medium text-purple-700 mb-1">회의 안건 첨언</p>
                          <p className="text-sm text-purple-900">{agenda.notes}</p>
                        </div>
                      ) : null;
                    })()}

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{daysSinceCreation}일 경과</span>
                      </div>
                      <span>등록자: {ticket.reporterName}</span>
                      <span>담당자: {ticket.assigneeName || '미지정'}</span>
                      <span>등록일: {format(new Date(ticket.createdAt), 'yyyy-MM-dd', { locale: ko })}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleDetailClick(ticket.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      상세보기
                    </button>
                    <button
                      onClick={() => handleCompleteClick(ticket.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      완료하기
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
        <DialogContent className="sm:max-w-[450px]">
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