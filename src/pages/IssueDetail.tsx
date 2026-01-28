import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority, RankLevel, Rank } from '../types';
import {
  ArrowLeft,
  User,
  Calendar,
  Tag as TagIcon,
  CheckCircle2,
  Paperclip,
  MoreVertical,
  Edit,
  Users,
  Send,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AssigneeAssignment } from '../components/AssigneeAssignment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateIssueStatus, deleteIssue, updateIssue, updateIssueAssignee, user } = useApp();

  const issue = issues.find(i => i.id === id);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const handleDelete = () => {
    if (issue) {
      deleteIssue(issue.id);
      navigate('/issues');
    }
  };

  if (!issue) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">이슈를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 이슈가 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/issues')}
            className="px-6 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700"
          >
            이슈 목록으로
          </button>
        </div>
      </div>
    );
  }

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

  // 담당자/참조자 배정 여부 확인
  useEffect(() => {
    if (issue && !issue.assigneeId && !showAssignmentModal) {
      setShowAssignmentModal(true);
    }
  }, [issue, showAssignmentModal]);

  const handleAssignmentComplete = (assignee: { id: string; name: string } | null, cc: Array<{ id: string; name: string }>) => {
    if (assignee) {
      updateIssueAssignee(issue.id, assignee.id, assignee.name);
      // 담당자 배정 시 상태를 처리중으로 변경
      if (issue.status === IssueStatus.PENDING) {
        updateIssueStatus(issue.id, IssueStatus.IN_PROGRESS);
      }
      // CC 업데이트
      updateIssue(issue.id, { cc });
      setShowAssignmentModal(false);
    }
  };

  const handleCompleteClick = () => {
    if (issue.status === IssueStatus.IN_PROGRESS) {
      setShowCompletionModal(true);
    }
  };

  const handleCompleteConfirm = () => {
    if (!completionReason.trim()) {
      alert('완료 사유를 입력해주세요.');
      return;
    }

    updateIssueStatus(issue.id, IssueStatus.RESOLVED, completionReason);
    setShowCompletionModal(false);
    setCompletionReason('');
  };

  // 주간 회의 안건으로 바로 이동
  const handleMoveToMeeting = () => {
    updateIssueStatus(issue.id, IssueStatus.MEETING);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 담당자/참조자 배정 모달 (z-index 최상위) - 배정되지 않은 경우에만 표시 */}
      {issue && !issue.assigneeId && showAssignmentModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center">
          <AssigneeAssignment
            ticketId={issue.id}
            currentAssignee={null}
            currentCC={[]}
            onAssignmentChange={handleAssignmentComplete}
            isModal={true}
          />
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">이슈 상세</h1>
            <p className="text-sm text-gray-500">
              이슈 ID: {issue.id} · {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 주간 회의 안건 등록 버튼 (이사급 이상만) */}
          {user && RankLevel[user.rank] >= RankLevel[Rank.ISA] && (
            <button
              onClick={handleMoveToMeeting}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>회의 안건 등록</span>
            </button>
          )}
          {/* 수정 버튼 */}
          <button
            onClick={() => navigate(`/issues/${id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-sm"
          >
            <Edit className="w-4 h-4" />
            <span>수정</span>
          </button>
          {/* 삭제 버튼 */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제</span>
          </button>
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
                <Calendar className="w-4 h-4" />
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

          {/* 태그 */}
          {issue.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TagIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">태그</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-water-blue-50 text-water-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 코멘트 및 첨부파일 (더미) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">활동</h3>
            </div>

            <div className="space-y-4">
              {/* 코멘트 입력 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="코멘트를 입력하세요..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">파일 첨부</span>
                      </button>
                      <button className="px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 text-sm">
                        코멘트 작성
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 사이드바 */}
        <div className="space-y-6 w-full lg:min-w-[400px]">
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
              {issue.status === IssueStatus.PENDING && '담당자를 배정하면 처리중 상태로 변경됩니다.'}
              {issue.status === IssueStatus.IN_PROGRESS && '티켓을 완료하려면 완료 처리 버튼을 클릭하세요.'}
              {issue.status === IssueStatus.MEETING && '주간 회의에서 처리될 예정입니다.'}
              {issue.status === IssueStatus.RESOLVED && '이 티켓은 완료되었습니다.'}
            </div>
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
              <div>
                <p className="text-xs text-gray-500 mb-1">열람 권한</p>
                <p className="text-sm text-gray-800 font-medium">
                  {issue.readLevel === 'JUIM' ? 'JUIM' : issue.readLevel} 이상
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default IssueDetail;
