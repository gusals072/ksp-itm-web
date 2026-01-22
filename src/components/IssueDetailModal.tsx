import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  Download
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
} from './ui/dialog';
import { motion } from 'framer-motion';

interface IssueDetailModalProps {
  issueId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueChange?: (newIssueId: string) => void; // 연관된 이슈 클릭 시 호출
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issueId, isOpen, onClose, onIssueChange }) => {
  const navigate = useNavigate();
  const { issues, updateIssueStatus, deleteIssue, updateIssue, updateIssueAssignee, user, addMeetingAgenda, meetingAgendas } = useApp();

  const issue = issueId ? issues.find(i => i.id === issueId) : null;
  
  // 회의 안건 첨언 찾기
  const meetingAgenda = issue ? meetingAgendas.find(a => a.issueId === issue.id) : null;
  const agendaNote = meetingAgenda?.notes;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingNote, setMeetingNote] = useState('');
  const [showAgendaNoteModal, setShowAgendaNoteModal] = useState(false);
  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteModal(false);
      setShowCompletionModal(false);
      setCompletionReason('');
      setShowMeetingModal(false);
      setMeetingNote('');
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (issue) {
      deleteIssue(issue.id);
      setShowDeleteModal(false);
      onClose();
    }
  };

  // 담당자가 처리 시작
  const handleStartProcessing = () => {
    if (issue && issue.assigneeId && user?.id === issue.assigneeId && issue.status === IssueStatus.PENDING) {
      updateIssueStatus(issue.id, IssueStatus.IN_PROGRESS);
    }
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

    updateIssueStatus(issue.id, IssueStatus.RESOLVED, completionReason);
    setShowCompletionModal(false);
    setCompletionReason('');
    onClose(); // 완료 처리 시 모달 자동 닫기
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

  // 회의 안건 등록 권한 체크 (담당자, 생성자, 대표)
  const canMoveToMeeting = () => {
    if (!user || !issue) return false;
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
      {/* 오른쪽: 댓글 컨테이너 (모달 옆에 붙임) - Portal 사용 */}
      {isOpen && issue && typeof window !== 'undefined' && createPortal(
        <motion.div 
          className="fixed bg-white shadow-2xl z-[100] border border-gray-200 rounded-xl flex flex-col"
          style={{ 
            pointerEvents: 'auto',
            // 메인 모달과 동일한 top 위치, 메인 모달 오른쪽에 배치
            // 메인 모달 left: calc(50% - 30.25rem), 너비: 56rem, top: 15%
            // 댓글 컨테이너 left: 메인 모달 left + 메인 모달 너비 + 간격(0.5rem)
            left: 'calc(50% - 30.25rem + 56rem + 0.5rem)',
            top: '15%',
            width: '20rem', // w-80 (320px)
            height: '72vh', // 댓글 컨테이너는 항상 전체 높이 유지
            maxHeight: '72vh',
            transform: 'translateY(0)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <IssueComments issue={issue} user={user} isReadOnly={issue.status === IssueStatus.RESOLVED} />
        </motion.div>,
        document.body
      )}


      {/* 메인 이슈 상세 모달 */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[72vh] overflow-hidden p-0 flex flex-col" id="issue-detail-modal" hideClose>
          <div className="p-6 flex-1 overflow-y-auto">
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">이슈 상세</h1>
                  <p className="text-sm text-gray-500">
                    이슈 ID: {issue.id} · {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* 주간 회의 안건 등록 버튼 (담당자, 생성자, 대표만) */}
                {user && canMoveToMeeting() && issue.status !== IssueStatus.MEETING && issue.status !== IssueStatus.RESOLVED && (
                  <button
                    onClick={handleMoveToMeeting}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>주간 회의 안건 등록</span>
                  </button>
                )}
                {/* 수정 버튼 (완료된 티켓에서는 숨김, 담당자 또는 생성자만 가능) */}
                {issue.status !== IssueStatus.RESOLVED && user && (user.id === issue.reporterId || user.id === issue.assigneeId) && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/issues/${issue.id}/edit`);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                )}
                {/* 삭제 버튼 (완료된 티켓에서는 숨김, 담당자 또는 생성자만 가능) */}
                {issue.status !== IssueStatus.RESOLVED && user && (user.id === issue.reporterId || user.id === issue.assigneeId) && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                )}
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 상세 정보 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 상태 및 메타 정보 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)} flex-shrink-0`}
                        title={getPriorityText(issue.priority)}
                      />
                      <h2 className="text-2xl font-bold text-gray-800">{issue.title}</h2>
                    </div>
                    {issue.assigneeId && (
                      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        담당자: {issue.assigneeName}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                {issue.attachments && issue.attachments.length > 0 && (
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
                )}

                {/* 연관된 이슈 */}
                {issue.relatedIssues && issue.relatedIssues.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <LinkIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">연관된 이슈</h3>
                    </div>
                    <div className="space-y-2">
                      {issue.relatedIssues.map(relatedIssueId => {
                        const relatedIssue = issues.find(i => i.id === relatedIssueId);
                        if (!relatedIssue) return null;
                        return (
                          <div
                            key={relatedIssueId}
                            onClick={() => {
                              if (onIssueChange) {
                                onIssueChange(relatedIssueId);
                              }
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
                  </div>
                )}

              </div>

              {/* 오른쪽: 사이드바 */}
              <div className="space-y-6">
                {/* 상태 표시 및 완료 버튼 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">티켓 상태</h3>
                  
                  {/* 현재 상태 표시 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">현재 상태</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                        {getStatusText(issue.status)}
                      </span>
                    </div>
                  </div>

                  {/* 담당자가 처리 시작 버튼 (PENDING 상태이고 담당자가 본인인 경우) */}
                  {issue.status === IssueStatus.PENDING && issue.assigneeId && user?.id === issue.assigneeId && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-center">
                        <button
                          onClick={handleStartProcessing}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          처리 시작
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 처리중 상태에서만 완료 버튼 표시 */}
                  {issue.status === IssueStatus.IN_PROGRESS && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-center">
                        <button
                          onClick={handleCompleteClick}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          완료 처리
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 상태 설명 */}
                  <div className="mt-4 text-xs text-gray-500">
                    {issue.status === IssueStatus.PENDING && issue.assigneeId && '담당자가 처리 시작 버튼을 클릭하면 처리중 상태로 변경됩니다.'}
                    {issue.status === IssueStatus.PENDING && !issue.assigneeId && '담당자가 배정되지 않았습니다.'}
                    {issue.status === IssueStatus.IN_PROGRESS && '티켓을 완료하려면 완료 처리 버튼을 클릭하세요.'}
                    {issue.status === IssueStatus.MEETING && '주간 회의에서 처리될 예정입니다.'}
                    {issue.status === IssueStatus.RESOLVED && '이 티켓은 완료되었습니다.'}
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">상세 정보</h3>
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
        </DialogContent>
      </Dialog>

      {/* 완료 사유 입력 모달 */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-[500px]">
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
              placeholder="완료 방법을 입력하세요..."
              value={completionReason}
              onChange={(e) => setCompletionReason(e.target.value)}
            />
            {!completionReason.trim() && (
              <p className="text-xs text-red-500 mt-2">완료 사유를 입력해주세요.</p>
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

      {/* 회의 안건 첨언 확인 모달 */}
      <Dialog open={showAgendaNoteModal} onOpenChange={setShowAgendaNoteModal}>
        <DialogContent className="sm:max-w-[500px]">
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

      {/* 회의 안건 등록 모달 */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              주간 회의 안건 등록
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
        <DialogContent className="sm:max-w-[450px]">
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
    </>
  );
};

export default IssueDetailModal;

