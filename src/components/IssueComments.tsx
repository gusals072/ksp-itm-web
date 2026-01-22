import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Paperclip, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Issue } from '../types';

interface IssueCommentsProps {
  issue: Issue;
  user: { id: string; name: string } | null;
  isReadOnly?: boolean; // 읽기 전용 모드 (완료된 티켓 등)
}

const IssueComments: React.FC<IssueCommentsProps> = ({ issue, user, isReadOnly = false }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // TODO: 실제 댓글 저장 로직 구현
    console.log('댓글 작성:', commentText);
    setCommentText('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">댓글</h3>
      </div>

      {/* 댓글 목록 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 이슈 생성 알림 */}
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-water-blue-100 rounded-full flex items-center justify-center text-water-blue-600 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800">{issue.reporterName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </span>
            </div>
            <p className="text-gray-600 mt-1">이슈가 생성되었습니다.</p>
          </div>
        </div>

        {/* TODO: 실제 댓글 목록 렌더링 */}
      </div>

      {/* 댓글 입력 영역 (읽기 전용이 아닐 때만 표시) */}
      {!isReadOnly && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm">파일 첨부</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>댓글 작성</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IssueComments;

