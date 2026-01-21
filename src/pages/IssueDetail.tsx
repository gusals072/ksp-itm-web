import React, { useState } from 'react';
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

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateIssueStatus, deleteIssue, user } = useApp();

  const issue = issues.find(i => i.id === id);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      case IssueStatus.ASSIGNED:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case IssueStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case IssueStatus.REVIEW:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case IssueStatus.BLOCKED:
        return 'bg-red-100 text-red-800 border-red-300';
      case IssueStatus.ON_HOLD:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case IssueStatus.MEETING:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case IssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case IssueStatus.VERIFICATION:
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case IssueStatus.REOPENED:
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case IssueStatus.CANCELLED:
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case IssueStatus.INTERNALIZED:
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.PENDING:
        return '이슈 제기';
      case IssueStatus.ASSIGNED:
        return '배정됨';
      case IssueStatus.IN_PROGRESS:
        return '처리 중';
      case IssueStatus.REVIEW:
        return '검토 중';
      case IssueStatus.BLOCKED:
        return '차단됨';
      case IssueStatus.ON_HOLD:
        return '보류';
      case IssueStatus.MEETING:
        return '회의 예정';
      case IssueStatus.RESOLVED:
        return '해결됨';
      case IssueStatus.VERIFICATION:
        return '검증 중';
      case IssueStatus.REOPENED:
        return '재오픈';
      case IssueStatus.CANCELLED:
        return '취소됨';
      case IssueStatus.INTERNALIZED:
        return '내재화 완료';
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

  const handleStatusChange = (newStatus: IssueStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedStatus) {
      updateIssueStatus(issue.id, selectedStatus);
      setShowStatusModal(false);
      setSelectedStatus(null);
    }
  };

  // 주간 회의 안건으로 바로 이동
  const handleMoveToMeeting = () => {
    updateIssueStatus(issue.id, IssueStatus.MEETING);
  };

  const statusFlow: IssueStatus[] = [
    IssueStatus.PENDING,
    IssueStatus.ASSIGNED,
    IssueStatus.IN_PROGRESS,
    IssueStatus.REVIEW,
    IssueStatus.BLOCKED,
    IssueStatus.ON_HOLD,
    IssueStatus.MEETING,
    IssueStatus.RESOLVED,
    IssueStatus.VERIFICATION,
    IssueStatus.REOPENED,
    IssueStatus.CANCELLED,
    IssueStatus.INTERNALIZED
  ];

  const currentStatusIndex = statusFlow.indexOf(issue.status);

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
              <span>주간 회의 안건 등록</span>
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
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                배정팀
              </button>
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

              {/* 이슈 생성 알림 */}
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-water-blue-100 rounded-full flex items-center justify-center text-water-blue-600 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{issue.reporterName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">이슈가 생성되었습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 사이드바 */}
        <div className="space-y-6 w-full lg:min-w-[400px]">
          {/* 상태 변경 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">상태 변경</h3>
            <div className="grid grid-cols-3 gap-2.5 w-full">
              {statusFlow.map((status) => {
                const isActive = status === issue.status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`text-center px-2 py-2.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 text-xs w-full min-h-[60px] ${
                      isActive
                        ? 'bg-water-blue-600 text-white font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="leading-tight">{getStatusText(status)}</span>
                  </button>
                );
              })}
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
                  <p className="text-xs text-gray-500 mb-1">해결일</p>
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

      {/* 상태 변경 확인 모달 */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">상태 변경 확인</h3>
            <p className="text-gray-600 mb-6">
              이슈 상태를 <strong>"{getStatusText(selectedStatus)}"</strong>로 변경하시겠습니까?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">이슈 삭제 확인</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 이슈를 삭제하시겠습니까?<br />
              <span className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetail;
