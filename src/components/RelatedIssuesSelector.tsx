import React, { useState } from 'react';
import { Search, X, Link as LinkIcon } from 'lucide-react';
import type { Issue } from '../types';

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
          <div className="p-2 space-y-1">
            {filteredIssues.map(issue => (
              <button
                key={issue.id}
                type="button"
                onClick={() => handleAddIssue(issue.id)}
                className="w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                <p className="text-xs text-gray-500">ID: {issue.id}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {searchTerm && filteredIssues.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default RelatedIssuesSelector;

