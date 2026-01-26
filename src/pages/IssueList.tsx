import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority, RankLevel, type Issue } from '../types';
import { Search, Plus, User as UserIcon, Calendar, AlertCircle, Clock, Filter, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { isOverdue, getDaysSinceCreation } from '../utils/ticket';
import { isTerminalState } from '../constants/ticket';
import { motion, AnimatePresence } from 'framer-motion';
import IssueDetailModal from '../components/IssueDetailModal';

const IssueList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { issues, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // 필터링 및 정렬
  const filteredIssues = issues
    .filter(issue => {
      // 종료된 티켓과 회의 예정 티켓 제외
      const isClosed = isTerminalState(issue.status as any);
      const isInMeeting = issue.status === IssueStatus.MEETING;

      if (isClosed || isInMeeting) {
        return false; // 종료된 티켓과 회의 예정 티켓은 이슈 목록에서 제외
      }

      // 검색 (제목, 설명)
      const matchesSearch = searchTerm === '' || (
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 상태 필터
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

      // 우선순위 필터
      const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;

      // 카테고리 필터
      const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;

      // 권한 체크 (생성자, 참조자만 확인 가능)
      const canView = user && (
        issue.reporterId === user.id ||
        issue.cc?.some(ccUser => ccUser.id === user.id)
      );

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && canView;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title, 'ko');
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
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
    setSelectedIssueId(issueId);
    setIsModalOpen(true);
  };

  // 모든 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterCategory('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  // 활성 필터 개수 계산
  const activeFilterCount = [
    filterStatus !== 'all',
    filterPriority !== 'all',
    filterCategory !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // 고유 카테고리 목록
  const categories = Array.from(new Set(issues.map(i => i.category).filter(Boolean))).sort();

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
        {/* 검색 및 기본 필터 */}
        <div className="flex flex-col gap-4">
          {/* 상단: 검색창과 주요 액션 */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* 검색창 */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none text-base transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* 필터 접기/펼치기 버튼 */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all font-medium ${
                isFilterExpanded
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-water-blue-100 text-water-blue-700 hover:bg-water-blue-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{isFilterExpanded ? '필터 접기' : '필터 펼치기'}</span>
              {!isFilterExpanded && activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-water-blue-600 text-white rounded-full text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
              {isFilterExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* 이슈 등록 버튼 */}
            <button
              onClick={() => navigate('/issues/new')}
              className="flex items-center space-x-2 px-6 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>이슈 등록</span>
            </button>
          </div>

          {/* 필터 영역 */}
          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 pt-4 border-t border-gray-200"
              >
            {/* 기본 필터 섹션 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">기본 필터</span>
              </div>

              {/* 상태 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">상태</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'PENDING', 'IN_PROGRESS'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterStatus === status
                          ? 'bg-water-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? '전체 상태' : getStatusText(status as IssueStatus)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 우선순위 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">우선순위</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFilterPriority(priority)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                        filterPriority === priority
                          ? 'bg-water-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority !== 'all' && (
                        <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(priority as Priority)}`} />
                      )}
                      <span>{priority === 'all' ? '전체 우선순위' : getPriorityText(priority as Priority)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 고급 필터 섹션 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">고급 필터</span>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showAdvancedFilters
                      ? 'bg-water-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showAdvancedFilters ? '숨기기' : '보이기'}
                  {activeFilterCount > 0 && !showAdvancedFilters && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* 고급 필터 내용 (카테고리, 정렬) */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 pt-2"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 카테고리 필터 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none bg-white text-sm"
                      >
                        <option value="all">전체 카테고리</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 정렬 옵션 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        정렬 기준
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'title')}
                          className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none bg-white text-sm"
                        >
                          <option value="date">등록일</option>
                          <option value="priority">우선순위</option>
                          <option value="title">제목</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium bg-white"
                          title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 필터 초기화 및 활성 필터 표시 */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
              {activeFilterCount > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">적용된 필터 ({activeFilterCount}개)</span>
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>모두 초기화</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterStatus !== 'all' && (
                      <span className="px-2.5 py-1 bg-water-blue-100 text-water-blue-700 rounded-md text-xs font-medium flex items-center space-x-1">
                        <span>상태:</span>
                        <span className="font-semibold">{getStatusText(filterStatus as IssueStatus)}</span>
                        <button
                          onClick={() => setFilterStatus('all')}
                          className="ml-1 hover:text-water-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filterPriority !== 'all' && (
                      <span className="px-2.5 py-1 bg-water-blue-100 text-water-blue-700 rounded-md text-xs font-medium flex items-center space-x-1">
                        <span>우선순위:</span>
                        <span className="font-semibold">{getPriorityText(filterPriority as Priority)}</span>
                        <button
                          onClick={() => setFilterPriority('all')}
                          className="ml-1 hover:text-water-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filterCategory !== 'all' && (
                      <span className="px-2.5 py-1 bg-water-blue-100 text-water-blue-700 rounded-md text-xs font-medium flex items-center space-x-1">
                        <span>카테고리:</span>
                        <span className="font-semibold">{filterCategory}</span>
                        <button
                          onClick={() => setFilterCategory('all')}
                          className="ml-1 hover:text-water-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-2.5 py-1 bg-water-blue-100 text-water-blue-700 rounded-md text-xs font-medium flex items-center space-x-1">
                        <span>검색:</span>
                        <span className="font-semibold">"{searchTerm}"</span>
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-water-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            </motion.div>
            )}
          </AnimatePresence>
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
            <div className="col-span-1">참조자</div>
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

                {/* 참조자 */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {(() => {
                        if (!issue.cc || issue.cc.length === 0) {
                          return '미지정';
                        } else if (issue.cc.length === 1) {
                          return issue.cc[0].name;
                        } else {
                          return `${issue.cc[0].name}외 ${issue.cc.length - 1}명`;
                        }
                      })()}
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
              다른 검색어나 필터를 시도해보세요.
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
      </motion.div>

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

export default IssueList;
