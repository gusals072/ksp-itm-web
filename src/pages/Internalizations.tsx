import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueStatus, Priority } from '../types';
import { Archive, FileText, User, Calendar, Tag, CheckCircle2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const Internalizations: React.FC = () => {
  const navigate = useNavigate();
  const { closedTickets, user } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | IssueStatus>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'issue' | 'meeting'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="p-6">
      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 검색창 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 설명, 종료 사유로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | IssueStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">전체 상태</option>
              <option value={IssueStatus.RESOLVED}>완료됨</option>
            </select>
          </div>

          {/* 출처 필터 */}
          <div className="flex items-center gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as 'all' | 'issue' | 'meeting')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">전체 출처</option>
              <option value="issue">이슈 목록</option>
              <option value="meeting">주간 회의</option>
            </select>
          </div>
        </div>
      </div>

      {/* 완료된 티켓 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-all hover:border-water-blue-400 cursor-pointer flex flex-col"
            onClick={() => navigate(`/issues/${ticket.issueId}`)}
          >
            <div className="p-4 flex flex-col flex-1">
              {/* 티켓 헤더 */}
              <div className="mb-3 pb-3 border-b-2 border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-water-blue-100 rounded-full flex items-center justify-center">
                      <Archive className="w-4 h-4 text-water-blue-600" />
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center gap-1 ${getStatusColor(ticket.finalStatus)}`}
                    >
                      {getStatusIcon(ticket.finalStatus)}
                      {getStatusText(ticket.finalStatus)}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 hover:text-water-blue-600 transition-colors line-clamp-2 mb-1">
                  {ticket.issueTitle}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">{ticket.issueDescription}</p>
              </div>

              {/* 티켓 정보 */}
              <div className="space-y-1.5 mb-3 flex-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-water-blue-500 flex-shrink-0" />
                    <span className="truncate">담당자: {ticket.assigneeName || '미지정'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                    <span className="text-xs">{getPriorityText(ticket.priority)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-water-blue-500 flex-shrink-0" />
                  <span className="truncate">종료일: {format(new Date(ticket.closedDate), 'yyyy-MM-dd', { locale: ko })}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <FileText className="w-3.5 h-3.5 text-water-blue-500 flex-shrink-0" />
                  <span className="truncate">출처: {getSourceText(ticket.source)}</span>
                </div>
                {ticket.category && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Tag className="w-3.5 h-3.5 text-water-blue-500 flex-shrink-0" />
                    <span className="truncate">카테고리: {ticket.category}</span>
                  </div>
                )}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ticket.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-water-blue-50 text-water-blue-700 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {ticket.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{ticket.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {ticket.closedReason && (
                  <div className="bg-gray-50 border-l-4 border-water-blue-300 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      완료 방법
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-3">{ticket.closedReason}</p>
                  </div>
                )}
              </div>

              {/* 하단 정보 */}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>등록일: {format(new Date(ticket.createdAt), 'yyyy-MM-dd', { locale: ko })}</span>
                  <span>등록자: {ticket.reporterName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 결과 없음 */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">완료된 티켓이 없습니다</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterSource !== 'all'
              ? '검색 조건에 맞는 완료된 티켓이 없습니다.'
              : '아직 완료된 티켓이 없습니다. 이슈 목록이나 주간 회의에서 티켓을 종료하면 여기에 보관됩니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Internalizations;
