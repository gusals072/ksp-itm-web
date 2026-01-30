import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EditIssueModal from './EditIssueModal';
import { IssueStatus, Priority, RankLevel, Rank } from '../types';
import {
  User,
  Calendar as CalendarIcon,
  CheckCircle2,
  Edit,
  Send,
  Trash2,
  Link as LinkIcon,
  Paperclip,
  File,
  Download,
  RotateCcw,
  RotateCw,
  Ticket,
  ArrowBigRightDash
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import IssueComments from './IssueComments';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  VisuallyHidden,
} from './ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel } from 'swiper/modules';

interface IssueDetailModalProps {
  issueId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueChange?: (newIssueId: string) => void; // 연관된 이슈 클릭 시 호출
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issueId, isOpen, onClose, onIssueChange }) => {
  const navigate = useNavigate();
  const { issues, updateIssueStatus, deleteIssue, updateIssue, updateIssueAssignee, reopenTicket, user, addMeetingAgenda, meetingAgendas, closedTickets } = useApp();

  // 모달 스택 관리 (이전 이슈 ID들의 히스토리)
  const [modalStack, setModalStack] = useState<string[]>([]);
  const [currentIssueId, setCurrentIssueId] = useState<string | null>(issueId);

  // issueId가 변경되면 currentIssueId 업데이트
  useEffect(() => {
    if (issueId) {
      setCurrentIssueId(issueId);
      setModalStack([]); // 새로운 모달이 열릴 때 스택 초기화
    }
  }, [issueId]);

  const issue = currentIssueId ? issues.find(i => i.id === currentIssueId) : null;
  
  // 회의 안건 첨언 찾기
  const meetingAgenda = issue ? meetingAgendas.find(a => a.issueId === issue.id) : null;
  const agendaNote = meetingAgenda?.notes;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingNote, setMeetingNote] = useState('');
  const [showAgendaNoteModal, setShowAgendaNoteModal] = useState(false);
  const [showStartProcessingModal, setShowStartProcessingModal] = useState(false);
  const [showRevertToPendingModal, setShowRevertToPendingModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relatedIssuesSlideIndex, setRelatedIssuesSlideIndex] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMessageClosing, setIsMessageClosing] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<IssueStatus | null>(null);
  
  // 상태 변경 추적 - 이전 상태를 저장하여 애니메이션 방향 결정
  useEffect(() => {
    if (issue) {
      // 초기 로드 시에만 현재 상태로 설정
      if (previousStatus === null) {
        setPreviousStatus(issue.status);
      } else if (previousStatus !== issue.status) {
        // 상태가 변경되었을 때는 이전 상태를 유지 (애니메이션 방향 결정용)
        // 애니메이션 완료 후 이전 상태 업데이트
        const timer = setTimeout(() => {
          setPreviousStatus(issue.status);
        }, 500); // 애니메이션 완료 후 업데이트
        return () => clearTimeout(timer);
      }
    }
  }, [issue?.status, previousStatus]);
  
  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteModal(false);
      setShowCompletionModal(false);
      setCompletionReason('');
      setShowMeetingModal(false);
      setMeetingNote('');
      setShowStartProcessingModal(false);
      setShowRevertToPendingModal(false);
      setShowReopenModal(false);
      setShowEditModal(false);
      setShowCompletionAnimation(false);
      setIsClosing(false);
      setIsMessageClosing(false);
      setModalStack([]);
      setCurrentIssueId(null);
      setPreviousStatus(null);
    }
  }, [isOpen]);

  // 모달 닫기 핸들러 (스택이 있으면 이전 이슈로 돌아가고, 없으면 완전히 닫기)
  const handleClose = () => {
    if (modalStack.length > 0) {
      // 스택에서 마지막 이슈를 가져와서 현재 이슈로 설정
      const previousIssueId = modalStack[modalStack.length - 1];
      setModalStack(prev => prev.slice(0, -1));
      setCurrentIssueId(previousIssueId);
    } else {
      // 스택이 비어있으면 완전히 닫기
      onClose();
    }
  };

  const handleDelete = () => {
    if (issue) {
      deleteIssue(issue.id);
      setShowDeleteModal(false);
      onClose();
    }
  };

  // 참조자가 처리 시작 (확인 모달 표시)
  const handleStartProcessingClick = () => {
    if (issue && issue.status === IssueStatus.PENDING) {
      setShowStartProcessingModal(true);
    }
  };

  // 처리 시작 확인
  const handleStartProcessingConfirm = () => {
    if (issue) {
      updateIssueStatus(issue.id, IssueStatus.IN_PROGRESS);
      setShowStartProcessingModal(false);
    }
  };

  // 처리중 상태를 대기 상태로 되돌리기 (확인 모달 표시)
  const handleRevertToPendingClick = () => {
    if (issue && issue.status === IssueStatus.IN_PROGRESS) {
      setShowRevertToPendingModal(true);
    }
  };

  // 대기 상태로 되돌리기 확인
  const handleRevertToPendingConfirm = () => {
    if (issue) {
      updateIssueStatus(issue.id, IssueStatus.PENDING);
      setShowRevertToPendingModal(false);
    }
  };

  // 현재 사용자가 참조자인지 확인 (super_admin은 항상 true)
  const isUserInCC = (): boolean => {
    if (!issue || !user) return false;
    if (user.role === 'super_admin') return true;
    return issue.cc?.some(cc => cc.id === user.id) || false;
  };

  const handleCompleteClick = () => {
    if (issue?.status === IssueStatus.IN_PROGRESS) {
      setShowCompletionModal(true);
    }
  };

  const handleCompleteConfirm = () => {
    if (!completionReason.trim() || !issue) {
      alert('완료 사유를 입력해주세요.');
      return;
    }

    // 완료 사유 모달 닫기
    setShowCompletionModal(false);
    
    // 완료 애니메이션 시작
    setShowCompletionAnimation(true);
    
    // 체크 아이콘 애니메이션 후 상태 업데이트
    setTimeout(() => {
      updateIssueStatus(issue.id, IssueStatus.RESOLVED, completionReason);
      setCompletionReason('');
    }, 800); // 체크 아이콘 애니메이션 완료 후 (더 빠르게)
    
    // 모달 페이드아웃 시작
    setTimeout(() => {
      // 모달 페이드아웃 시작
      setIsClosing(true);
      
      // 모달 페이드아웃이 완전히 끝나는 순간에 모달 닫기
      setTimeout(() => {
        onClose(); // 모달 닫기
        setIsClosing(false);
        
        // 모달이 닫힌 후 메시지 페이드아웃 시작
        setTimeout(() => {
          setIsMessageClosing(true);
          
          // 메시지 페이드아웃이 끝나면 애니메이션 완전히 종료
          setTimeout(() => {
            setShowCompletionAnimation(false);
            setIsMessageClosing(false);
          }, 300); // 메시지 페이드아웃 시간 (0.3초, 더 빠르게)
        }, 50); // 모달 닫힌 후 약간의 딜레이 (더 빠르게)
      }, 300); // 모달 페이드아웃 시간 (0.3초, 더 빠르게)
    }, 1500); // "완료되었습니다!" 메시지 표시 시간 (더 빠르게)
  };

  // 주간 회의 안건으로 이동 (첨언 입력 모달 표시)
  const handleMoveToMeeting = () => {
    if (issue) {
      setShowMeetingModal(true);
    }
  };

  // 회의 안건 등록 확인
  const handleMeetingConfirm = () => {
    if (!issue) return;
    
    // 회의 안건 생성
    addMeetingAgenda({
      issueId: issue.id,
      issueTitle: issue.title,
      status: 'pending',
      meetingDate: new Date(),
      notes: meetingNote.trim() || undefined
    });

    // 이슈 상태를 회의 예정으로 변경
    updateIssueStatus(issue.id, IssueStatus.MEETING);
    
    setShowMeetingModal(false);
    setMeetingNote('');
    onClose(); // 회의 안건 등록 시 모달 자동 닫기
  };

  // 티켓 재오픈 확인 모달 표시
  const handleReopenTicketClick = () => {
    setShowReopenModal(true);
  };

  // 티켓 재오픈 핸들러
  const handleReopenTicket = () => {
    if (!issue) return;
    
    setShowReopenModal(false);
    
    // closedTickets에서 해당 티켓 찾기
    const closedTicket = closedTickets.find(t => t.issueId === issue.id);
    if (closedTicket) {
      reopenTicket(closedTicket.id);
    } else {
      // 이미 issues에 있는 경우: reopened 플래그 설정하고 상태를 PENDING으로 변경, 등록일을 재오픈 날짜로 변경
      updateIssue(issue.id, { reopened: true, createdAt: new Date() });
      updateIssueStatus(issue.id, IssueStatus.PENDING);
    }
  };

  // 회의 안건 등록 권한 체크 (super_admin, 담당자, 생성자, 대표)
  const canMoveToMeeting = () => {
    if (!user || !issue) return false;
    // 총괄 관리자
    if (user.role === 'super_admin') return true;
    // 대표
    if (user.rank === Rank.DAEPIO) return true;
    // 생성자
    if (user.id === issue.reporterId) return true;
    // 담당자
    if (user.id === issue.assigneeId) return true;
    return false;
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.PENDING:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case IssueStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case IssueStatus.MEETING:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case IssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.PENDING:
        return '이슈 제기';
      case IssueStatus.IN_PROGRESS:
        return '처리 중';
      case IssueStatus.MEETING:
        return '회의 예정';
      case IssueStatus.RESOLVED:
        return '완료됨';
      default:
        return status;
    }
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

  if (!issue) {
    return null;
  }

  return (
    <>
      {/* 완료 애니메이션 오버레이 (Portal로 렌더링) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCompletionAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isClosing || isMessageClosing ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                pointerEvents: isClosing || isMessageClosing ? 'none' : 'auto'
              }}
            >
              <motion.div 
                className="flex flex-col items-center justify-center space-y-6"
                animate={{ 
                  opacity: isMessageClosing ? 0 : 1
                }}
                transition={{ 
                  duration: 0.5
                }}
              >
                {/* 체크 아이콘 애니메이션 */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.34, 1.56, 0.64, 1] // 탄성 효과
                  }}
                  className="relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      delay: 0.2
                    }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </motion.div>
                  {/* 펄스 효과 */}
                  {!isMessageClosing && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ 
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                  )}
                </motion.div>
                
                {/* 완료 메시지 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0 
                  }}
                  transition={{ 
                    duration: 0.3,
                    delay: 0.2
                  }}
                  className="text-white text-2xl font-bold"
                >
                  완료되었습니다!
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 메인 이슈 상세 모달 */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="issue-detail-modal max-w-[95vw] md:max-w-[calc(100vw-20rem)] lg:max-w-[calc(100vw-22rem)] xl:max-w-[1600px] max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-0 flex flex-col z-[10000] mx-2 md:mx-4" 
          id="issue-detail-modal" 
          hideClose
          overlayOpacity={isClosing ? 0 : 1}
          isClosing={isClosing}
        >
          <VisuallyHidden>
            <DialogTitle>이슈 상세</DialogTitle>
            <DialogDescription>이슈의 상세 정보를 확인하고 관리할 수 있습니다.</DialogDescription>
          </VisuallyHidden>
          <motion.div
            animate={{ 
              opacity: isClosing ? 0 : 1,
              x: isClosing ? 100 : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full w-full"
          >
          <AnimatePresence mode="wait">
            {issue && (
              <motion.div
                key={currentIssueId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 md:p-6 flex-1 flex flex-col"
              >
            {/* 헤더 */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800">이슈 상세</h1>
                  <p className="text-xs md:text-sm text-gray-500">
                    이슈 ID: {issue.id} · {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-2 flex-wrap gap-2">
                {/* 되돌리기 버튼 (처리 중 상태일 때만, super_admin 또는 참조자만 가능) */}
                {issue.status === IssueStatus.IN_PROGRESS && (user?.role === 'super_admin' || isUserInCC()) && (
                  <button
                    onClick={handleRevertToPendingClick}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-sm text-xs md:text-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">되돌리기</span>
                    <span className="sm:hidden">되돌림</span>
                  </button>
                )}
                {/* 주간 회의 안건 등록 버튼 (담당자, 생성자, 대표만) */}
                {user && canMoveToMeeting() && issue.status !== IssueStatus.MEETING && issue.status !== IssueStatus.RESOLVED && (
                  <button
                    onClick={handleMoveToMeeting}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm text-xs md:text-sm"
                  >
                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">회의 안건 등록</span>
                    <span className="sm:hidden">회의</span>
                  </button>
                )}
                {/* 수정 버튼 (완료된 티켓에서는 숨김, super_admin 또는 참조자 또는 생성자만 가능) */}
                {issue.status !== IssueStatus.RESOLVED && user && (user.role === 'super_admin' || user.id === issue.reporterId || isUserInCC()) && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-sm text-xs md:text-sm"
                  >
                    <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>수정</span>
                  </button>
                )}
                {/* 삭제 버튼 (완료된 티켓에서는 숨김, super_admin 또는 참조자 또는 생성자만 가능) */}
                {issue.status !== IssueStatus.RESOLVED && user && (user.role === 'super_admin' || user.id === issue.reporterId || isUserInCC()) && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-sm text-xs md:text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>삭제</span>
                  </button>
                )}
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* 왼쪽: 상세 정보 */}
              <div className="lg:col-span-3 space-y-4 md:space-y-6 overflow-y-auto pr-0 md:pr-2">
                {/* 상태 및 메타 정보 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${getPriorityColor(issue.priority)} flex-shrink-0`}
                        title={getPriorityText(issue.priority)}
                      />
                      <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{issue.title}</h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{issue.reporterName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(new Date(issue.createdAt), 'yyyy-MM-dd', { locale: ko })}</span>
                    </div>
                    {issue.cc && issue.cc.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>참조: {issue.cc.map(cc => cc.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 설명 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">설명</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                    {issue.description}
                  </div>
                </div>

                {/* 첨부파일 */}
                {issue.attachments && issue.attachments.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">첨부파일</h3>
                      <span className="text-sm text-gray-500">({issue.attachments.length}개)</span>
                    </div>
                    <div className="space-y-2">
                      {issue.attachments.map(attachment => {
                        const formatFileSize = (bytes: number) => {
                          if (bytes < 1024) return bytes + ' B';
                          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
                          return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                        };

                        const getFileIcon = (type: string) => {
                          if (type.includes('pdf')) return 'text-red-500';
                          if (type.includes('word') || type.includes('document')) return 'text-blue-500';
                          if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-500';
                          if (type.includes('image')) return 'text-purple-500';
                          return 'text-gray-500';
                        };

                        return (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`flex-shrink-0 ${getFileIcon(attachment.type)}`}>
                                <File className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (attachment.url) {
                                  window.open(attachment.url, '_blank');
                                } else {
                                  // 실제 다운로드 기능은 구현되지 않았으므로 알림만 표시
                                  alert(`파일 다운로드: ${attachment.name}\n(실제 다운로드 기능은 구현되지 않았습니다.)`);
                                }
                              }}
                              className="ml-3 flex-shrink-0 p-2 text-water-blue-600 hover:bg-water-blue-50 rounded-lg transition-colors"
                              title="다운로드"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500">첨부 파일이 없습니다.</p>
                    </div>
                  </div>
                )}

                {/* 연관된 이슈 */}
                {issue.relatedIssues && issue.relatedIssues.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <LinkIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">연관된 이슈</h3>
                    </div>
                    {issue.relatedIssues.length >= 2 ? (
                      <>
                        <Swiper
                          modules={[Keyboard, Mousewheel]}
                          spaceBetween={16}
                          slidesPerView={1}
                          keyboard={{ enabled: true }}
                          mousewheel={{ enabled: true, forceToAxis: true }}
                          className="related-issues-swiper"
                          onSlideChange={(swiper) => setRelatedIssuesSlideIndex(swiper.activeIndex)}
                        >
                          {issue.relatedIssues.map(relatedIssueId => {
                            const relatedIssue = issues.find(i => i.id === relatedIssueId);
                            if (!relatedIssue) return null;
                            return (
                              <SwiperSlide key={relatedIssueId}>
                                <div
                                  onClick={() => {
                                    // 현재 이슈를 스택에 추가하고 새 이슈로 변경
                                    if (currentIssueId) {
                                      setModalStack(prev => [...prev, currentIssueId]);
                                    }
                                    setCurrentIssueId(relatedIssueId);
                                  }}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
                                >
                                  <LinkIcon className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{relatedIssue.title}</p>
                                    <p className="text-xs text-gray-500">ID: {relatedIssue.id}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                                      relatedIssue.status === IssueStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                      relatedIssue.status === IssueStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                      relatedIssue.status === IssueStatus.MEETING ? 'bg-purple-100 text-purple-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {relatedIssue.status === IssueStatus.PENDING ? '대기' :
                                       relatedIssue.status === IssueStatus.IN_PROGRESS ? '처리중' :
                                       relatedIssue.status === IssueStatus.MEETING ? '회의예정' : '완료'}
                                    </span>
                                  </div>
                                </div>
                              </SwiperSlide>
                            );
                          })}
                        </Swiper>
                        {/* 라디오 버튼 스타일 인디케이터 */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {issue.relatedIssues.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                // Swiper 인스턴스에 접근하여 슬라이드 이동
                                const swiperEl = document.querySelector('.related-issues-swiper') as any;
                                if (swiperEl && swiperEl.swiper) {
                                  swiperEl.swiper.slideTo(index);
                                }
                              }}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === relatedIssuesSlideIndex
                                  ? 'bg-water-blue-600 w-8'
                                  : 'bg-gray-300 hover:bg-gray-400 w-2'
                              }`}
                              aria-label={`연관 이슈 ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {issue.relatedIssues.map(relatedIssueId => {
                          const relatedIssue = issues.find(i => i.id === relatedIssueId);
                          if (!relatedIssue) return null;
                          return (
                            <div
                              key={relatedIssueId}
                              onClick={() => {
                                // 현재 이슈를 스택에 추가하고 새 이슈로 변경
                                if (currentIssueId) {
                                  setModalStack(prev => [...prev, currentIssueId]);
                                }
                                setCurrentIssueId(relatedIssueId);
                              }}
                              className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
                            >
                              <LinkIcon className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{relatedIssue.title}</p>
                                <p className="text-xs text-gray-500">ID: {relatedIssue.id}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  relatedIssue.status === IssueStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                  relatedIssue.status === IssueStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                  relatedIssue.status === IssueStatus.MEETING ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {relatedIssue.status === IssueStatus.PENDING ? '대기' :
                                   relatedIssue.status === IssueStatus.IN_PROGRESS ? '처리중' :
                                   relatedIssue.status === IssueStatus.MEETING ? '회의예정' : '완료'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500">연관된 이슈가 없습니다.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* 오른쪽: 사이드바 */}
              <div className="lg:col-span-1">
                {/* 사이드바 영역 */}
                <div className="space-y-6 overflow-y-auto pr-2">
                {/* 상태 표시 및 완료 버튼 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-gray-800">티켓 상태</h3>
                    {/* 재오픈 배지 */}
                    {issue.reopened && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                        재오픈됨
                      </span>
                    )}
                  </div>
                  
                  {/* 현재 상태 표시 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">현재 상태</span>
                      <div className="relative flex items-center">
                        {/* 상태 아이콘 영역 - 슬라이드 전환 애니메이션 */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 overflow-hidden">
                          <AnimatePresence mode="wait" initial={false}>
                            {issue.status === IssueStatus.PENDING && (
                              <motion.div
                                key="ticket-icon"
                                initial={{ 
                                  opacity: 0, 
                                  x: previousStatus === IssueStatus.IN_PROGRESS ? 20 : -20 
                                }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ 
                                  opacity: 0, 
                                  x: 20 
                                }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <Ticket className="w-8 h-8 text-gray-600" />
                              </motion.div>
                            )}
                            {issue.status === IssueStatus.IN_PROGRESS && (
                              <motion.div
                                key="arrow-icon"
                                initial={{ 
                                  opacity: 0, 
                                  x: previousStatus === IssueStatus.PENDING ? -20 : 20 
                                }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ 
                                  opacity: 0, 
                                  x: -20 
                                }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <ArrowBigRightDash className="w-8 h-8 text-blue-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="relative overflow-hidden min-w-[80px]">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={issue.status}
                              initial={{ 
                                opacity: 0, 
                                x: previousStatus === IssueStatus.IN_PROGRESS && issue.status === IssueStatus.PENDING ? 20 : 
                                   previousStatus === IssueStatus.PENDING && issue.status === IssueStatus.IN_PROGRESS ? -20 : -20
                              }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ 
                                opacity: 0, 
                                x: previousStatus === IssueStatus.IN_PROGRESS ? -20 : 20
                              }}
                              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)} block text-center`}
                            >
                              {getStatusText(issue.status)}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 버튼 영역 - 상태에 따라 슬라이드 전환 효과 */}
                  <div className="border-t border-gray-200 pt-4 relative overflow-hidden min-h-[60px]">
                    <AnimatePresence mode="wait" initial={false}>
                      {/* 재오픈 버튼 (완료된 티켓일 때만) */}
                      {issue.status === IssueStatus.RESOLVED && user && (user.role === 'super_admin' || user.id === issue.reporterId || isUserInCC()) && (
                        <motion.div
                          key="reopen-button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-center"
                        >
                          <button
                            onClick={handleReopenTicketClick}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <RotateCw className="w-4 h-4" />
                            재오픈
                          </button>
                        </motion.div>
                      )}

                      {issue.status === IssueStatus.PENDING && (user?.role === 'super_admin' || isUserInCC()) && (
                        <motion.div
                          key="pending-button"
                          initial={{ 
                            opacity: 0, 
                            x: previousStatus === IssueStatus.IN_PROGRESS ? 20 : -20 
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ 
                            opacity: 0, 
                            x: -20 
                          }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                          className="flex justify-center"
                        >
                          <button
                            onClick={handleStartProcessingClick}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            처리 시작
                          </button>
                        </motion.div>
                      )}

                      {issue.status === IssueStatus.IN_PROGRESS && (user?.role === 'super_admin' || isUserInCC()) && (
                        <motion.div
                          key="complete-button"
                          initial={{ 
                            opacity: 0, 
                            x: previousStatus === IssueStatus.PENDING ? -20 : 20 
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ 
                            opacity: 0, 
                            x: 20 
                          }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                          className="flex justify-center"
                        >
                          <button
                            onClick={handleCompleteClick}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            완료 처리
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 상태 설명 */}
                  <div className="mt-4 text-xs text-gray-500">
                    {issue.status === IssueStatus.PENDING && issue.cc && issue.cc.length > 0 && '처리 시작 버튼을 클릭하여 시작하세요.'}
                    {issue.status === IssueStatus.PENDING && (!issue.cc || issue.cc.length === 0) && '참조자가 배정되지 않았습니다.'}
                    {issue.status === IssueStatus.IN_PROGRESS && '티켓을 완료하려면 완료 처리 버튼을 클릭하세요.'}
                    {issue.status === IssueStatus.MEETING && '주간 회의에서 처리될 예정입니다.'}
                    {issue.status === IssueStatus.RESOLVED && !issue.reopened && '이 티켓은 완료되었습니다.'}
                    {issue.status === IssueStatus.RESOLVED && issue.reopened && '이 티켓은 재오픈되었습니다.'}
                    {issue.reopened && issue.status !== IssueStatus.RESOLVED && '재오픈된 티켓입니다. 이슈 제기 상태부터 다시 시작합니다.'}
                  </div>

                  {/* 회의 안건 첨언 확인 버튼 */}
                  {issue.status === IssueStatus.MEETING && agendaNote && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <button
                        onClick={() => setShowAgendaNoteModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                      >
                        <Send className="w-4 h-4" />
                        첨언 확인하기
                      </button>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">상세 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">카테고리</p>
                      <p className="text-sm text-gray-800 font-medium">{issue.category || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">우선순위</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-2 rounded-full ${getPriorityColor(issue.priority)}`} />
                        <p className="text-sm text-gray-800 font-medium">{getPriorityText(issue.priority)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">생성일</p>
                      <p className="text-sm text-gray-800">
                        {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">수정일</p>
                      <p className="text-sm text-gray-800">
                        {format(new Date(issue.updatedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </p>
                    </div>
                    {issue.resolvedDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">완료일</p>
                        <p className="text-sm text-gray-800">
                          {format(new Date(issue.resolvedDate), 'yyyy-MM-dd HH:mm', { locale: ko })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <IssueComments issue={issue} user={user} isReadOnly={issue.status === IssueStatus.RESOLVED && !issue.reopened} />
            </div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* 완료 사유 입력 모달 */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-[500px] z-[10002]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              티켓 완료 처리
            </DialogTitle>
            <DialogDescription>
              이 티켓을 어떻게 완료했는지 설명해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-water-blue-500 focus:border-transparent resize-none transition-all"
              rows={5}
              placeholder="내용을 입력하세요..."
              value={completionReason}
              onChange={(e) => setCompletionReason(e.target.value)}
            />
            {!completionReason.trim() && (
              <p className="text-xs text-red-500 mt-2">완료 내용을 입력해주세요.</p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowCompletionModal(false);
                setCompletionReason('');
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleCompleteConfirm}
              disabled={!completionReason.trim()}
              className="px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              완료하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 재오픈 확인 모달 */}
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="sm:max-w-[500px] z-[10002]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-orange-600" />
              티켓 재오픈
            </DialogTitle>
            <DialogDescription>
              정말 티켓을 재오픈하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              재오픈된 티켓은 이슈 제기 상태부터 다시 시작하며, 재오픈 상태는 계속 유지됩니다.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowReopenModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleReopenTicket}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              재오픈하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회의 안건 첨언 확인 모달 */}
      <Dialog open={showAgendaNoteModal} onOpenChange={setShowAgendaNoteModal}>
        <DialogContent className="sm:max-w-[500px] z-[10010]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              회의 안건 첨언
            </DialogTitle>
            <DialogDescription>
              이 티켓을 회의 안건으로 등록할 때 작성된 첨언입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {agendaNote ? (
              <div className="bg-purple-50 border-l-4 border-purple-400 rounded p-4">
                <p className="text-sm text-purple-900 whitespace-pre-line leading-relaxed">
                  {agendaNote}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">첨언이 없습니다.</p>
            )}
            {meetingAgenda?.meetingDate && (
              <div className="mt-4 text-xs text-gray-500">
                등록일: {format(new Date(meetingAgenda.meetingDate), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowAgendaNoteModal(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 처리 시작 확인 모달 */}
      <Dialog open={showStartProcessingModal} onOpenChange={setShowStartProcessingModal}>
        <DialogContent className="sm:max-w-[500px] z-[10002]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              처리 시작 확인
            </DialogTitle>
            <DialogDescription>
              이 티켓을 처리중 상태로 변경하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              티켓이 처리중 상태로 변경되며, 작업을 시작할 준비가 되었음을 의미합니다.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowStartProcessingModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleStartProcessingConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              처리 시작
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 대기 상태로 되돌리기 확인 모달 */}
      <Dialog open={showRevertToPendingModal} onOpenChange={setShowRevertToPendingModal}>
        <DialogContent className="sm:max-w-[500px] z-[10002]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              대기 상태로 되돌리기 확인
            </DialogTitle>
            <DialogDescription>
              이 티켓을 대기 상태로 되돌리시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              티켓이 대기 상태로 변경되며, 다시 처리 시작할 수 있습니다.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowRevertToPendingModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleRevertToPendingConfirm}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              되돌리기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회의 안건 등록 모달 */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent className="sm:max-w-[500px] z-[10004]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              회의 안건 등록
            </DialogTitle>
            <DialogDescription>
              이 티켓을 회의 안건으로 등록합니다. 왜 회의 안건으로 넘겼는지 첨언을 추가할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첨언 (선택사항)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              rows={5}
              placeholder="왜 회의 안건으로 넘겼는지 설명해주세요..."
              value={meetingNote}
              onChange={(e) => setMeetingNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowMeetingModal(false);
                setMeetingNote('');
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleMeetingConfirm}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              등록하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[450px] z-[10004]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              이슈 삭제 확인
            </DialogTitle>
            <DialogDescription className="pt-2">
              정말로 이 이슈를 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-500 font-medium">이 작업은 되돌릴 수 없습니다.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이슈 수정 모달 */}
      {issue && (
        <EditIssueModal
          issueId={issue.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            // 수정 성공 시 이슈 상세 모달 새로고침을 위해 닫았다가 다시 열기
            // 또는 상태를 다시 로드하도록 처리
          }}
        />
      )}
    </>
  );
};

export default IssueDetailModal;

