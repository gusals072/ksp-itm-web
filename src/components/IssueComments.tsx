import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Paperclip, Send, File, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Issue } from '../types';

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

interface IssueCommentsProps {
  issue: Issue;
  user: { id: string; name: string } | null;
  isReadOnly?: boolean; // 읽기 전용 모드 (완료된 티켓 등)
}

const IssueComments: React.FC<IssueCommentsProps> = ({ issue, user, isReadOnly = false }) => {
  const [commentText, setCommentText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsFileDialogOpen(false);
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 모달이 닫히지 않도록 이벤트 전파 방지
    
    if (!commentText.trim() && attachedFiles.length === 0) return;
    if (!user) return;
    
    // 임시 댓글 저장 (로컬 상태에 저장)
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date(),
      attachments: attachedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    setAttachedFiles([]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
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

        {/* 댓글 목록 */}
        {comments.map(comment => (
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
              <p className="text-gray-700 mt-1 whitespace-pre-line">{comment.text}</p>
              {/* 첨부 파일 표시 */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {comment.attachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                      <File className="w-3 h-3" />
                      <span>{attachment.name}</span>
                      <span className="text-gray-400">
                        ({attachment.size < 1024 ? attachment.size + ' B' : 
                          attachment.size < 1024 * 1024 ? (attachment.size / 1024).toFixed(2) + ' KB' : 
                          (attachment.size / (1024 * 1024)).toFixed(2) + ' MB'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력 영역 (읽기 전용이 아닐 때만 표시) */}
      {!isReadOnly && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl" onClick={(e) => e.stopPropagation()}>
          <form 
            onSubmit={handleSubmitComment} 
            className="space-y-2" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
                {/* 첨부된 파일 목록 */}
                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hidden"
                      id="comment-file-input"
                    />
                    <button
                      type="button"
                      data-file-attach-button="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFileDialogOpen(true);
                        // 파일 다이얼로그 열기 (다음 틱에서 실행하여 이벤트 처리 완료 후)
                        setTimeout(() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }, 0);
                      }}
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">파일 첨부</span>
                    </button>
                    {attachedFiles.length > 0 && (
                      <span className="text-xs text-gray-500">({attachedFiles.length}개)</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    disabled={!commentText.trim() && attachedFiles.length === 0}
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

