import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority, RankLevel, type Issue } from '../types';
import { Search, Plus, User as UserIcon, Calendar, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

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
      // 종료된 티켓 제외 (해결됨, 보류됨, 차단됨, 취소됨)
      const isClosed = [
        IssueStatus.RESOLVED,
        IssueStatus.ON_HOLD,
        IssueStatus.BLOCKED,
        IssueStatus.CANCELLED
      ].includes(issue.status);

      if (isClosed) {
        return false; // 종료된 티켓은 이슈 목록에서 제외
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

  // 디데이 계산 (등록일 기준 일주일)
  const getDDay = (issue: Issue): string | null => {
    // 해결되거나 내재화 완료된 이슈는 D-Day 표시 안함
    if (issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.INTERNALIZED) {
      return null;
    }

    const createdAt = new Date(issue.createdAt);
    const deadlineDate = new Date(createdAt);
    deadlineDate.setDate(deadlineDate.getDate() + 7); // 등록일로부터 7일 후

    const daysLeft = differenceInDays(deadlineDate, new Date());
    
    if (daysLeft > 0) {
      return `D-${daysLeft}`;
    } else if (daysLeft === 0) {
      return 'D-Day';
    } else {
      return `D+${Math.abs(daysLeft)}`;
    }
  };

  const getDDayColor = (issue: Issue): string => {
    // 해결되거나 내재화 완료된 이슈는 색상 없음
    if (issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.INTERNALIZED) {
      return '';
    }

    const createdAt = new Date(issue.createdAt);
    const deadlineDate = new Date(createdAt);
    deadlineDate.setDate(deadlineDate.getDate() + 7); // 등록일로부터 7일 후

    const daysLeft = differenceInDays(deadlineDate, new Date());
    
    if (daysLeft < 0) {
      // 지난 날짜 (이미 자동으로 회의 안건으로 넘어갔을 것)
      return 'text-gray-500 bg-gray-100 border border-gray-300';
    } else if (daysLeft === 0) {
      // 오늘 (D-Day)
      return 'text-white font-bold bg-red-600 border-2 border-red-700 shadow-lg';
    } else if (daysLeft <= 3) {
      // 3일 이내
      return 'text-white font-bold bg-red-500 border-2 border-red-600 shadow-md';
    } else if (daysLeft <= 7) {
      // 7일 이내
      return 'text-white font-semibold bg-orange-500 border-2 border-orange-600 shadow-sm';
    } else {
      // 7일 이상 (이론적으로는 나올 수 없지만 안전을 위해)
      return 'text-water-blue-700 font-semibold bg-water-blue-100 border-2 border-water-blue-300';
    }
  };

  // 테이블 행 클릭
  const handleRowClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
              <option value="ASSIGNED">배정됨</option>
              <option value="IN_PROGRESS">처리 중</option>
              <option value="REVIEW">검토 중</option>
              <option value="BLOCKED">차단됨</option>
              <option value="ON_HOLD">보류</option>
              <option value="MEETING">회의 예정</option>
              <option value="RESOLVED">해결됨</option>
              <option value="VERIFICATION">검증 중</option>
              <option value="REOPENED">재오픈</option>
              <option value="CANCELLED">취소됨</option>
              <option value="INTERNALIZED">내재화 완료</option>
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
      </div>

      {/* 이슈 테이블 (Jira 스타일) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleRowClick(issue.id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-base"
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

                {/* D-Day */}
                <div className="col-span-1">
                  {(() => {
                    const dDay = getDDay(issue);
                    if (dDay) {
                      return (
                        <span className={`px-3 py-2 rounded-lg text-sm font-bold ${getDDayColor(issue)} inline-block text-center min-w-[100px]`}>
                          {dDay}
                        </span>
                      );
                    }
                    return <span className="text-sm text-gray-400">-</span>;
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">
              {showMyIssues ? '당신이 담당자인 이슈가 없습니다.' : '다른 검색어나 필터를 시도해보세요.'}
            </p>
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      <div className="mt-6 text-center text-lg text-gray-600 bg-white rounded-xl shadow-sm border border-gray-200 py-4">
        총 <span className="font-bold text-water-blue-600">{filteredIssues.length}</span>개의 이슈
        (전체 {issues.length}개 중)
        {showMyIssues && <span className="ml-2 text-orange-600 font-medium">| 내 이슈(담당자)만 표시 중</span>}
      </div>
    </div>
  );
};

export default IssueList;
