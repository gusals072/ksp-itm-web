import React, { useState } from 'react';
import { Search, X, Link as LinkIcon, Eye, Check } from 'lucide-react';
import type { Issue, IssueStatus, User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import IssueDetailModal from './IssueDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

interface RelatedIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIssues: string[];
  onSelectionChange: (issueIds: string[]) => void;
  allIssues: Issue[];
  currentUser: User | null;
  excludeIssueId?: string; // 현재 편집 중인 이슈 ID (자기 자신 제외)
}

const RelatedIssuesModal: React.FC<RelatedIssuesModalProps> = ({
  isOpen,
  onClose,
  selectedIssues,
  onSelectionChange,
  allIssues,
  currentUser,
  excludeIssueId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewIssueId, setPreviewIssueId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // 권한 체크: super_admin은 모든 이슈 조회 가능, 그 외는 본인이 확인 가능한 이슈만
  const canViewIssue = (issue: Issue) => {
    if (!currentUser) return false;
    // 총괄 관리자는 모든 이슈 조회 가능
    if (currentUser.role === 'super_admin') return true;
    return (
      issue.reporterId === currentUser.id ||
      issue.cc?.some(ccUser => ccUser.id === currentUser.id)
    );
  };

  // 본인이 확인 가능한 이슈만 필터링
  const viewableIssues = allIssues.filter(issue => {
    if (excludeIssueId && issue.id === excludeIssueId) return false; // 자기 자신 제외
    return canViewIssue(issue);
  });

  // 검색 필터링
  const filteredIssues = viewableIssues.filter(issue => {
    if (selectedIssues.includes(issue.id)) return false; // 이미 선택된 것은 제외
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower) ||
      issue.id.toLowerCase().includes(searchLower)
    );
  });

  const selectedIssuesData = viewableIssues.filter(issue => selectedIssues.includes(issue.id));

  const handleAddIssue = (issueId: string) => {
    if (!selectedIssues.includes(issueId)) {
      onSelectionChange([...selectedIssues, issueId]);
      setSearchTerm('');
    }
  };

  const handleRemoveIssue = (issueId: string) => {
    onSelectionChange(selectedIssues.filter(id => id !== issueId));
  };

  const handleToggleIssue = (issueId: string) => {
    if (selectedIssues.includes(issueId)) {
      handleRemoveIssue(issueId);
    } else {
      handleAddIssue(issueId);
    }
  };

  const handlePreviewIssue = (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIssueId(issueId);
    setIsPreviewModalOpen(true);
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'MEETING':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleSave = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-water-blue-600" />
              연관 이슈 선택
            </DialogTitle>
            <DialogDescription>
              본인이 확인 가능한 이슈만 선택할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
            {/* 검색 입력 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이슈 제목, 설명, ID로 검색..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* 선택된 이슈 목록 */}
            {selectedIssuesData.length > 0 && (
              <div className="mb-4 border-2 border-water-blue-200 rounded-lg p-3 bg-water-blue-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  선택된 이슈 ({selectedIssuesData.length}개)
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedIssuesData.map(issue => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-water-blue-200"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <LinkIcon className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                          <p className="text-xs text-gray-500">ID: {issue.id}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(issue.id)}
                        className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 검색 결과 또는 전체 이슈 목록 */}
            <div className="flex-1 overflow-y-auto border-2 border-gray-200 rounded-lg">
              <AnimatePresence mode="wait">
                {searchTerm ? (
                  filteredIssues.length > 0 ? (
                    <motion.div
                      key="search-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-3 space-y-2"
                    >
                      {filteredIssues.map(issue => (
                        <div
                          key={issue.id}
                          className={`group border rounded-lg p-3 transition-all cursor-pointer ${
                            selectedIssues.includes(issue.id)
                              ? 'border-water-blue-400 bg-water-blue-50'
                              : 'border-gray-200 hover:border-water-blue-400 hover:bg-water-blue-50'
                          }`}
                          onClick={() => handleToggleIssue(issue.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} flex-shrink-0`} />
                                <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                                {selectedIssues.includes(issue.id) && (
                                  <Check className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                <span>ID: {issue.id}</span>
                                <span className={`px-2 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                                  {getStatusText(issue.status)}
                                </span>
                              </div>
                              {issue.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={(e) => handlePreviewIssue(issue.id, e)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-water-blue-600 hover:bg-water-blue-100 rounded transition-colors"
                              title="상세 보기"
                            >
                              <Eye className="w-3 h-3" />
                              <span>상세 보기</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 text-center"
                    >
                      <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="all-issues"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 space-y-2"
                  >
                    {viewableIssues.filter(issue => !selectedIssues.includes(issue.id)).length > 0 ? (
                      viewableIssues
                        .filter(issue => !selectedIssues.includes(issue.id))
                        .map(issue => (
                          <div
                            key={issue.id}
                            className="group border border-gray-200 rounded-lg p-3 hover:border-water-blue-400 hover:bg-water-blue-50 transition-all cursor-pointer"
                            onClick={() => handleToggleIssue(issue.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} flex-shrink-0`} />
                                  <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                  <span>ID: {issue.id}</span>
                                  <span className={`px-2 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                                    {getStatusText(issue.status)}
                                  </span>
                                </div>
                                {issue.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              <button
                                type="button"
                                onClick={(e) => handlePreviewIssue(issue.id, e)}
                                className="flex items-center space-x-1 px-2 py-1 text-xs text-water-blue-600 hover:bg-water-blue-100 rounded transition-colors"
                                title="상세 보기"
                              >
                                <Eye className="w-3 h-3" />
                                <span>상세 보기</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddIssue(issue.id);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-water-blue-600 text-white hover:bg-water-blue-700 rounded transition-colors"
                              >
                                <LinkIcon className="w-3 h-3" />
                                <span>연결</span>
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-gray-500">확인 가능한 이슈가 없습니다.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이슈 상세 미리보기 모달 */}
      <IssueDetailModal
        issueId={previewIssueId}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewIssueId(null);
        }}
      />
    </>
  );
};

export default RelatedIssuesModal;

