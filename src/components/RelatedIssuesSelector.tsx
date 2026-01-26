import React, { useState } from 'react';
import { Search, X, Link as LinkIcon, ExternalLink, Eye } from 'lucide-react';
import type { Issue, IssueStatus } from '../types';
import IssueDetailModal from './IssueDetailModal';

interface RelatedIssuesSelectorProps {
  selectedIssues: string[];
  onSelectionChange: (issueIds: string[]) => void;
  allIssues: Issue[];
}

const RelatedIssuesSelector: React.FC<RelatedIssuesSelectorProps> = ({
  selectedIssues,
  onSelectionChange,
  allIssues
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewIssueId, setPreviewIssueId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredIssues = allIssues.filter(issue => {
    if (selectedIssues.includes(issue.id)) return false; // 이미 선택된 것은 제외
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower) ||
      issue.id.toLowerCase().includes(searchLower)
    );
  });

  const selectedIssuesData = allIssues.filter(issue => selectedIssues.includes(issue.id));

  const handleAddIssue = (issueId: string) => {
    if (!selectedIssues.includes(issueId)) {
      onSelectionChange([...selectedIssues, issueId]);
      setSearchTerm('');
    }
  };

  const handleRemoveIssue = (issueId: string) => {
    onSelectionChange(selectedIssues.filter(id => id !== issueId));
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

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      <div className="relative">
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
        <div className="border-2 border-water-blue-200 rounded-lg p-3 bg-water-blue-50">
          <p className="text-sm font-medium text-gray-700 mb-2">연관된 이슈 ({selectedIssuesData.length}개)</p>
          <div className="space-y-2">
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

      {/* 검색 결과 */}
      {searchTerm && filteredIssues.length > 0 && (
        <div className="border-2 border-gray-300 rounded-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-2">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="group border border-gray-200 rounded-lg p-3 hover:border-water-blue-400 hover:bg-water-blue-50 transition-all"
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
                    onClick={() => handleAddIssue(issue.id)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-water-blue-600 text-white hover:bg-water-blue-700 rounded transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>연결</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && filteredIssues.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">검색 결과가 없습니다.</p>
      )}

      {/* 이슈 상세 미리보기 모달 */}
      <IssueDetailModal
        issueId={previewIssueId}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewIssueId(null);
        }}
      />
    </div>
  );
};

export default RelatedIssuesSelector;

