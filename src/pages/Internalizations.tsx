import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority } from '../types';
import { Archive, FileText, User, CheckCircle2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';
import IssueDetailModal from '../components/IssueDetailModal';

const Internalizations: React.FC = () => {
  const { closedTickets, user } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | IssueStatus>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'issue' | 'meeting'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 권한 체크: 사용자가 볼 수 있는 티켓만 필터링
  const canViewTicket = (_ticket: typeof closedTickets[0]) => {
    if (!user) return false;
    // 원본 이슈의 readLevel을 확인할 수 없으므로 모든 사용자가 볼 수 있도록 함
    // 실제로는 ticket에 readLevel 정보를 포함해야 함
    return true;
  };

  // 필터링
  const filteredTickets = closedTickets
    .filter(ticket => {
      if (!canViewTicket(ticket)) return false;

      // 검색어 필터
      const matchesSearch =
        ticket.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.closedReason?.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터
      const matchesStatus = filterStatus === 'all' || ticket.finalStatus === filterStatus;

      // 출처 필터
      const matchesSource = filterSource === 'all' || ticket.source === filterSource;

      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      // 최신 종료일 순 정렬
      return new Date(b.closedDate).getTime() - new Date(a.closedDate).getTime();
    });

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED:
        return '완료됨';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED:
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  const getSourceText = (source: 'issue' | 'meeting') => {
    return source === 'issue' ? '이슈 목록' : '주간 회의';
  };


  return (
    <motion.div
      className="p-3 md:p-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 검색 및 필터 */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 mb-4 md:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 검색창 */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 설명, 종료 사유로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none text-xs md:text-sm"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | IssueStatus)}
              className="px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white text-xs md:text-sm"
            >
              <option value="all">전체 상태</option>
              <option value={IssueStatus.RESOLVED}>완료됨</option>
            </select>
          </div>

          {/* 출처 필터 */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as 'all' | 'issue' | 'meeting')}
              className="px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white text-xs md:text-sm"
            >
              <option value="all">전체 출처</option>
              <option value="issue">이슈 목록</option>
              <option value="meeting">주간 회의</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 완료된 티켓 목록 - 게시판 형식 */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-1 hidden md:block">번호</div>
            <div className="col-span-6 md:col-span-4">제목</div>
            <div className="col-span-2 hidden lg:block">등록자</div>
            <div className="col-span-2 md:col-span-1">우선순위</div>
            <div className="col-span-2 md:col-span-1">출처</div>
            <div className="col-span-2 md:col-span-1">등록일</div>
            <div className="col-span-2 md:col-span-1">종료일</div>
            <div className="col-span-1 hidden xl:block">상태</div>
          </div>
        </div>

        {/* 테이블 본문 */}
        {filteredTickets.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedIssueId(ticket.issueId);
                  setIsModalOpen(true);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.02, duration: 0.3 }}
              >
                {/* 번호 */}
                <div className="col-span-1 hidden md:flex items-center">
                  <span className="text-xs md:text-sm text-gray-500 font-medium">{index + 1}</span>
                </div>

                {/* 제목 */}
                <div className="col-span-6 md:col-span-4 flex items-center min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${getPriorityColor(ticket.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs md:text-sm font-semibold text-gray-800 hover:text-water-blue-600 transition-colors truncate">
                        {ticket.issueTitle}
                      </h3>
                      {ticket.issueDescription && (
                        <p className="text-xs text-gray-500 truncate mt-0.5 hidden lg:block">
                          {ticket.issueDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 등록자 */}
                <div className="col-span-2 hidden lg:flex items-center">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-700 truncate">{ticket.reporterName}</span>
                  </div>
                </div>

                {/* 우선순위 */}
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                    <span className="text-xs md:text-sm text-gray-700 hidden sm:inline">{getPriorityText(ticket.priority)}</span>
                  </div>
                </div>

                {/* 출처 */}
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <span className="text-xs md:text-sm text-gray-700 truncate">{getSourceText(ticket.source)}</span>
                </div>

                {/* 등록일 */}
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <span className="text-xs md:text-sm text-gray-600">
                    {format(new Date(ticket.createdAt), 'yyyy-MM-dd', { locale: ko })}
                  </span>
                </div>

                {/* 종료일 */}
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <span className="text-xs md:text-sm text-gray-600 font-medium">
                    {format(new Date(ticket.closedDate), 'yyyy-MM-dd', { locale: ko })}
                  </span>
                </div>

                {/* 상태 */}
                <div className="col-span-1 hidden xl:flex items-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(ticket.finalStatus)}`}
                  >
                    {getStatusIcon(ticket.finalStatus)}
                    <span className="hidden 2xl:inline">{getStatusText(ticket.finalStatus)}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">완료된 티켓이 없습니다</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterSource !== 'all'
                ? '검색 조건에 맞는 완료된 티켓이 없습니다.'
                : '아직 완료된 티켓이 없습니다. 이슈 목록이나 주간 회의에서 티켓을 종료하면 여기에 보관됩니다.'}
            </p>
          </div>
        )}
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

export default Internalizations;
