import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority, RankLevel, type Issue } from '../types';
import { Search, Plus, User as UserIcon, Calendar, Filter, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { isOverdue, getDaysSinceCreation } from '../utils/ticket';
import { isTerminalState } from '../constants/ticket';
import { motion } from 'framer-motion';

const IssueList: React.FC = () => {
  const navigate = useNavigate();
  const { issues, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showMyIssues, setShowMyIssues] = useState(false);

  // 필터링 및 정렬
  const filteredIssues = issues
    .filter(issue => {
      // 종료된 티켓과 회의 예정 티켓 제외
      const isClosed = isTerminalState(issue.status as any);
      const isInMeeting = issue.status === ('MEETING_SCHEDULED' as any);

      if (isClosed || isInMeeting) {
        return false; // 종료된 티켓과 회의 예정 티켓은 이슈 목록에서 제외
      }

      // 검색
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

      // 우선순위 필터
      const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;

      // 권한 체크 (자신의 직급이 readLevel 이상이거나, 자신이 작성자/담당자/참조인원인 경우)
      const canView = user && (
        RankLevel[user.rank] >= RankLevel[issue.readLevel] ||
        issue.reporterId === user.id ||
        issue.assigneeId === user.id ||
        issue.cc?.some(ccUser => ccUser.id === user.id)
      );

      // 내 이슈 필터 (담당자인 이슈만)
      const isMyIssue = user && issue.assigneeId === user.id;

      const matchesMyIssues = !showMyIssues || isMyIssue;

      return matchesSearch && matchesStatus && matchesPriority && canView && matchesMyIssues;
    })
    .sort((a, b) => {
      // 기본: 최신순 정렬
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

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

  // Overdue 표시
  const getOverdueStatus = (issue: Issue) => {
    if (isTerminalState(issue.status as any)) {
      return null; // 종료된 티켓은 표시하지 않음
    }

    const createdAt = new Date(issue.createdAt);
    const daysSinceCreation = getDaysSinceCreation(createdAt);
    const isIssueOverdue = isOverdue(createdAt);

    if (isIssueOverdue) {
      return {
        type: 'overdue' as const,
        text: `${daysSinceCreation}일 경과`,
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: <AlertCircle className="w-3 h-3" />
      };
    } else if (daysSinceCreation >= 5) {
      return {
        type: 'warning' as const,
        text: `${daysSinceCreation}일 경과`,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <Clock className="w-3 h-3" />
      };
    }

    return null;
  };

  // 테이블 행 클릭
  const handleRowClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 검색 및 필터 */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* 검색창 */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="이슈 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none text-lg"
            />
          </div>

          {/* 필터 버튼 그룹 */}
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* 내 이슈 필터 */}
            <button
              onClick={() => setShowMyIssues(!showMyIssues)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-base font-semibold transition-colors ${
                showMyIssues
                  ? 'bg-water-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showMyIssues ? <CheckCircle className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              <span>{showMyIssues ? '내 담당 이슈만 보는 중' : '내 담당 이슈만 보기'}</span>
            </button>

            {/* 상태 필터 */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white text-base"
            >
              <option value="all">전체 상태</option>
              <option value="PENDING">이슈 제기</option>
              <option value="IN_PROGRESS">처리 중</option>
              <option value="MEETING">회의 예정</option>
              <option value="RESOLVED">완료됨</option>
            </select>

            {/* 우선순위 필터 */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white text-base"
            >
              <option value="all">전체 우선순위</option>
              <option value="URGENT">긴급</option>
              <option value="HIGH">높음</option>
              <option value="MEDIUM">보통</option>
              <option value="LOW">낮음</option>
            </select>

            {/* 이슈 등록 버튼 */}
            <button
              onClick={() => navigate('/issues/new')}
              className="flex items-center space-x-2 px-6 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors text-base font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>이슈 등록</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 이슈 테이블 (Jira 스타일) */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-1">이슈ID</div>
            <div className="col-span-4">제목</div>
            <div className="col-span-2">상태</div>
            <div className="col-span-1">우선순위</div>
            <div className="col-span-1">담당자</div>
            <div className="col-span-1">등록자</div>
            <div className="col-span-1">등록일</div>
            <div className="col-span-1">Dead Line</div>
          </div>
        </div>

        {/* 테이블 본문 */}
        {filteredIssues.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                onClick={() => handleRowClick(issue.id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.03, duration: 0.3 }}
              >
                {/* 이슈ID */}
                <div className="col-span-1">
                  <div className="text-gray-500 font-medium font-mono">
                    {issue.id}
                  </div>
                </div>

                {/* 제목 */}
                <div className="col-span-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 hover:text-water-blue-600 transition-colors truncate">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {issue.description}
                    </p>
                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {issue.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-water-blue-50 text-water-blue-700 text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 상태 */}
                <div className="col-span-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(issue.status)}`}
                  >
                    {getStatusText(issue.status)}
                  </span>
                </div>

                {/* 우선순위 (색상 + 텍스트) */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`}
                      title={getPriorityText(issue.priority)}
                    />
                    <span className="text-sm text-gray-600">{getPriorityText(issue.priority)}</span>
                  </div>
                </div>

                {/* 담당자 */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {issue.assigneeName ? issue.assigneeName : '미지정'}
                    </span>
                  </div>
                </div>

                {/* 등록자 */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {issue.reporterName}
                    </span>
                  </div>
                </div>

                {/* 등록일 */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(issue.createdAt), 'MM.dd', { locale: ko })}
                    </span>
                  </div>
                </div>

                {/* Overdue Status */}
                <div className="col-span-1">
                  {(() => {
                    const overdueInfo = getOverdueStatus(issue);
                    if (overdueInfo) {
                      return (
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${overdueInfo.className} flex items-center space-x-1 inline-flex`}>
                          {overdueInfo.icon}
                          <span>{overdueInfo.text}</span>
                        </span>
                      );
                    }
                    return <span className="text-sm text-gray-400">-</span>;
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">
              {showMyIssues ? '당신이 담당자인 이슈가 없습니다.' : '다른 검색어나 필터를 시도해보세요.'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* 통계 정보 */}
      <motion.div
        className="mt-6 text-center text-lg text-gray-600 bg-white rounded-xl shadow-sm border border-gray-200 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        총 <span className="font-bold text-water-blue-600">{filteredIssues.length}</span>개의 이슈
        (전체 {issues.length}개 중)
        {showMyIssues && <span className="ml-2 text-orange-600 font-medium">| 내 이슈(담당자)만 표시 중</span>}
      </motion.div>
    </motion.div>
  );
};

export default IssueList;
