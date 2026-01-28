import React, { useState, useRef } from 'react';
import { File, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Issue, Opinion } from '../types';
import { useApp } from '../context/AppContext';

interface IssueCommentsProps {
  issue: Issue;
  user: { id: string; name: string } | null;
  isReadOnly?: boolean; // 읽기 전용 모드 (완료된 티켓 등)
}

const IssueComments: React.FC<IssueCommentsProps> = ({ issue, user, isReadOnly = false }) => {
  const { addNotification } = useApp();
  const [comments, setComments] = useState<Opinion[]>([]);
  const [commentText, setCommentText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!commentText.trim() && attachedFiles.length === 0)) return;
    
    const newComment: Opinion = {
      id: Date.now().toString(),
      text: commentText.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date(),
      attachments: attachedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    setAttachedFiles([]);

    // 알림 전송: 티켓 참조자들에게 댓글 추가 알림
    const notifyUsers = [
      issue.reporterId, // 생성자
      ...(issue.cc || []).map(cc => cc.id) // 참조자들
    ].filter(id => id !== user.id); // 작성자 제외

    notifyUsers.forEach(userId => {
      addNotification({
        type: 'OPINION_ADDED',
        title: '새로운 댓글이 추가되었습니다',
        message: `${user.name}님이 "${issue.title}" 티켓에 댓글을 남겼습니다.`,
        issueId: issue.id,
        issueTitle: issue.title,
        userId
      });
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <div 
        className="flex flex-col h-full overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">댓글</h3>
        </div>

        {/* 댓글 목록 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 댓글 목록 */}
          {comments.map(comment => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="rounded-lg p-2">
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
                  {/* 첨부 파일 표시 */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {comment.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 text-xs text-gray-600">
                          <File className="w-3 h-3" />
                          <span>{attachment.name}</span>
                          <span className="text-gray-400">
                            ({formatFileSize(attachment.size)})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 댓글 입력 영역 */}
        {!isReadOnly && (
          <div className="p-4 border-t border-gray-100" data-comment-area="true">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none resize-none text-sm"
                rows={3}
              />
              
              {/* 첨부된 파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <File className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{file.name}</span>
                        <span className="text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="comment-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    data-file-attach-button="true"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>파일 첨부</span>
                  </button>
                  {attachedFiles.length > 0 && (
                    <span className="text-xs text-gray-500">({attachedFiles.length}개)</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim() && attachedFiles.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  <span>등록</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </>
  );
};

export default IssueComments;
