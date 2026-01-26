import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, RankLevel } from '../types';
import { Droplets, FileText, Clock, CheckCircle2, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Calendar from '../components/Calendar';
import IssueDetailModal from '../components/IssueDetailModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, meetingAgendas, closedTickets, user } = useApp();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 권한 기준 필터링 함수 (총괄 관리자는 모든 티켓 확인 가능, 그 외는 생성자/참조자만)
  const canViewIssue = (issue: typeof issues[0]) => {
    if (user?.role === 'super_admin') return true;
    if (!user) return false;
    return (
      issue.reporterId === user.id ||
      issue.assigneeId === user.id ||
      issue.cc?.some(ccUser => ccUser.id === user.id)
    );
  };

  // 권한 체크 후 이슈 필터링 (회의 안건 상태 및 완료된 티켓 제외)
  const visibleIssues = issues.filter(issue => 
    canViewIssue(issue) && 
    issue.status !== IssueStatus.MEETING && 
    issue.status !== IssueStatus.RESOLVED
  );

  // 통계 계산 (보이는 이슈 기준)
  // 진행 중인 티켓 통계 (회의 안건 제외)
  const activeStats = {
    total: visibleIssues.length,
    pending: visibleIssues.filter(i => i.status === IssueStatus.PENDING).length,
    inProgress: visibleIssues.filter(i => i.status === IssueStatus.IN_PROGRESS).length,
    meeting: 0 // 회의 안건은 이슈 목록에서 제외되므로 0
  };

  // 완료된 티켓 통계 (closedTickets 기준)
  const completedStats = {
    resolved: closedTickets.filter(t => t.finalStatus === IssueStatus.RESOLVED).length,
    totalCompleted: closedTickets.length
  };

  // 전체 통계 (진행 중 + 완료)
  const stats = {
    total: activeStats.total + completedStats.totalCompleted,
    pending: activeStats.pending,
    inProgress: activeStats.inProgress,
    meeting: activeStats.meeting,
    resolved: completedStats.resolved
  };

  // 최근 이슈 (최근 4개, 긴급 우선 표시, 권한 체크 후)
  const recentIssues = [...visibleIssues]
    .sort((a, b) => {
      // 긴급 이슈 우선, 그 다음 최신순
      if (a.priority === 'URGENT' && b.priority !== 'URGENT' && a.status !== IssueStatus.RESOLVED) return -1;
      if (b.priority === 'URGENT' && a.priority !== 'URGENT' && b.status !== IssueStatus.RESOLVED) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 4);

  // 주간 회의 예정 안건
  const upcomingMeetings = meetingAgendas.filter(a => a.status === 'pending').slice(0, 3);

  // 사용자 관련 이슈 (완료된 티켓 제외)
  const userReportedIssues = user ? issues.filter(i => 
    i.reporterId === user.id && i.status !== IssueStatus.RESOLVED
  ).slice(0, 5) : [];
  const userAssignedIssues = user ? issues.filter(i => 
    i.cc?.some(ccUser => ccUser.id === user.id) && i.status !== IssueStatus.RESOLVED
  ).slice(0, 5) : [];

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      className="p-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* 상단: 환영 메시지 + 통계 카드 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 환영 메시지 (축소) */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-r from-water-blue-600 to-water-teal-600 rounded-xl p-4 text-white shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex flex-col items-center justify-center w-full text-center space-y-2">
              <div className="flex items-center justify-center space-x-3 w-full">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-lg font-bold">K-SMARTPIA 이슈 티켓 매니지먼트 시스템</h2>
                <p className="text-xs text-water-blue-100">Issue Ticket Management System</p>
              </div>
            </div>
          </motion.div>

          {/* 통계 카드 (축소) */}
          <motion.div
            className="lg:col-span-4 grid grid-cols-5 gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/issues')}
            >
              <div className="flex flex-col items-center">
                <FileText className="w-5 h-5 text-water-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <span className="text-xs text-gray-500">총 이슈</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/issues?status=PENDING')}
            >
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                <span className="text-xs text-gray-500">이슈 제기</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/issues?status=IN_PROGRESS')}
            >
              <div className="flex flex-col items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
                <span className="text-xs text-gray-500">처리 중</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/meetings')}
            >
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.meeting}</p>
                <span className="text-xs text-gray-500">회의 예정</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/issues?status=RESOLVED')}
            >
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
                <span className="text-xs text-gray-500">완료됨</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 주요 섹션: 2열 레이아웃 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* 왼쪽: 나에게 할당된 이슈 (강조) */}
          {user && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-water-teal-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-water-teal-50">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-water-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">내가 참조된 이슈</h3>
                  {userAssignedIssues.length > 0 && (
                    <span className="ml-auto px-2 py-1 text-xs font-bold bg-water-teal-600 text-white rounded-full">
                      {userAssignedIssues.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                {userAssignedIssues.length > 0 ? (
                  <div className="space-y-2">
                    {userAssignedIssues.map(issue => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between p-3 bg-water-teal-50 rounded-lg hover:bg-water-teal-100 transition-colors border border-water-teal-200 cursor-pointer"
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <CalendarIcon className="w-4 h-4 text-water-teal-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(issue.createdAt), 'yyyy-MM-dd', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                            issue.status === IssueStatus.IN_PROGRESS
                              ? 'bg-blue-100 text-blue-800'
                              : issue.status === IssueStatus.MEETING
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {getStatusText(issue.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">참조된 이슈가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 중앙: 최근 이슈 (긴급 이슈 포함) */}
          <div 
            className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/issues')}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">최근 이슈</h3>
              <span className="text-xs text-gray-500 hover:text-water-blue-600 transition-colors">전체 보기 →</span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {recentIssues.map((issue) => {
                  const isUrgent = issue.priority === 'URGENT' && issue.status !== IssueStatus.RESOLVED;
                  return (
                    <div
                      key={issue.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isUrgent 
                          ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueId(issue.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <div
                        className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${getPriorityColor(issue.priority)} ${
                          isUrgent ? 'ring-2 ring-red-400' : ''
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {issue.title}
                            {isUrgent && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded">
                                긴급
                              </span>
                            )}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getStatusColor(issue.status)}`}
                          >
                            {getStatusText(issue.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {issue.reporterName} • {format(new Date(issue.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1">{issue.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 캘린더 */}
          <div className="lg:col-span-1">
            <Calendar issues={visibleIssues} user={user} />
          </div>
        </motion.div>

        {/* 하단: 기타 섹션 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* 내가 제기한 이슈 */}
          {user && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-water-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">내가 제기한 이슈</h3>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
                {userReportedIssues.length > 0 ? (
                  <div className="space-y-2">
                    {userReportedIssues.map(issue => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(issue.createdAt), 'yyyy-MM-dd', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                            issue.status === IssueStatus.PENDING
                              ? 'bg-yellow-100 text-yellow-800'
                              : issue.status === IssueStatus.IN_PROGRESS
                              ? 'bg-blue-100 text-blue-800'
                              : issue.status === IssueStatus.MEETING
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {getStatusText(issue.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">제기한 이슈가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주간 회의 안건 */}
          <div 
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/meetings')}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">회의 안건</h3>
              <span className="text-xs text-gray-500 hover:text-purple-600 transition-colors">전체 보기 →</span>
            </div>
            <div className="p-4">
              {upcomingMeetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {upcomingMeetings.map((agenda) => (
                    <div 
                      key={agenda.id} 
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueId(agenda.issueId);
                        setIsModalOpen(true);
                      }}
                    >
                      <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{agenda.issueTitle}</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(agenda.meetingDate), 'yyyy.MM.dd', { locale: ko })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">예정된 회의 안건이 없습니다.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

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

export default Dashboard;
