import React, { useState } from 'react';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Opinion } from '../types';
import AddOpinionModal from './AddOpinionModal';

interface OpinionCommentsProps {
  opinion: Opinion;
  user: { id: string; name: string } | null;
  isReadOnly?: boolean;
}

// 댓글 타입 (의견에 대한 댓글)
interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

const OpinionComments: React.FC<OpinionCommentsProps> = ({ opinion, user, isReadOnly = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  const handleAddComment = () => {
    setShowAddCommentModal(true);
  };

  const handleSubmitComment = (text: string, files: File[]) => {
    if (!user) return;
    
    // 댓글은 파일 첨부 없이 텍스트만
    const newComment: Comment = {
      id: Date.now().toString(),
      text: text.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date(),
    };
    
    setComments(prev => [...prev, newComment]);
    setShowAddCommentModal(false);
  };

  return (
    <>
      <div 
        className="flex flex-col h-full overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">댓글</h3>
          {/* 댓글 추가하기 버튼 (우상단) */}
          {!isReadOnly && (
            <button
              onClick={handleAddComment}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-water-blue-600 hover:text-water-blue-700 hover:bg-water-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>댓글 추가하기</span>
            </button>
          )}
        </div>

        {/* 댓글 목록 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">댓글이 없습니다.</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {comment.authorName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{comment.authorName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 댓글 추가 모달 */}
      {showAddCommentModal && (
        <AddOpinionModal
          isOpen={showAddCommentModal}
          onClose={() => {
            setShowAddCommentModal(false);
          }}
          onSubmit={handleSubmitComment}
          user={user}
        />
      )}
    </>
  );
};

export default OpinionComments;

