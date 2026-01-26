import React from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import type { Issue, IssueStatus, User } from '../types';
import IssueDetailModal from './IssueDetailModal';

interface DateIssuesSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  issues: Issue[];
  currentUser: User | null;
}

const DateIssuesSlideModal: React.FC<DateIssuesSlideModalProps> = ({
  isOpen,
  onClose,
  date,
  issues,
  currentUser
}) => {
  const [selectedIssueId, setSelectedIssueId] = React.useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  // 해당 날짜의 이슈 필터링 (완료된 티켓 제외)
  const dateIssues = React.useMemo(() => {
    if (!date) return [];
    const dateKey = format(date, 'yyyy-MM-dd');
    return issues.filter(issue => {
      // 완료된 티켓은 제외
      if (issue.status === 'RESOLVED') return false;
      const issueDateKey = format(new Date(issue.createdAt), 'yyyy-MM-dd');
      return issueDateKey === dateKey;
    });
  }, [date, issues]);

  // 권한 체크: 본인이 확인 가능한 이슈만 필터링
  const viewableIssues = React.useMemo(() => {
    if (!currentUser) return [];
    return dateIssues.filter(issue => {
      return (
        issue.reporterId === currentUser.id ||
        issue.cc?.some(ccUser => ccUser.id === currentUser.id)
      );
    });
  }, [dateIssues, currentUser]);

  const handleIssueClick = (issueId: string) => {
    setSelectedIssueId(issueId);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MEETING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case 'PENDING':
        return '대기';
      case 'IN_PROGRESS':
        return '처리중';
      case 'MEETING':
        return '회의예정';
      case 'RESOLVED':
        return '완료';
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
    <>
      <AnimatePresence>
        {isOpen && date && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-[9998]"
              onClick={onClose}
            />

            {/* 슬라이드 모달 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-water-blue-600 to-water-teal-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5" />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {format(date, 'yyyy년 M월 d일', { locale: ko })}
                      </h2>
                      <p className="text-sm text-white/80">
                        {viewableIssues.length}개의 이슈
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 이슈 목록 */}
              <div className="flex-1 overflow-y-auto p-4">
                {viewableIssues.length > 0 ? (
                  <div className="space-y-3">
                    {viewableIssues.map(issue => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: viewableIssues.indexOf(issue) * 0.05 }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-water-blue-400 hover:bg-water-blue-50 transition-all cursor-pointer"
                        onClick={() => handleIssueClick(issue.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} flex-shrink-0`} />
                            <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
                              {issue.title}
                            </h3>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(issue.status)}`}>
                            {getStatusText(issue.status)}
                          </span>
                        </div>
                        {issue.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {issue.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>ID: {issue.id}</span>
                          <span>
                            {format(new Date(issue.createdAt), 'HH:mm', { locale: ko })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      이 날짜에 확인 가능한 이슈가 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 이슈 상세 모달 */}
      <IssueDetailModal
        issueId={selectedIssueId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIssueId(null);
        }}
      />
    </>
  );
};

export default DateIssuesSlideModal;

