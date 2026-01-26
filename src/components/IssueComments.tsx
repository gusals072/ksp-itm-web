import React, { useState } from 'react';
import { CheckCircle2, File, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Issue, Opinion } from '../types';
import { useApp } from '../context/AppContext';
import AddOpinionModal from './AddOpinionModal';
import OpinionDetailModal from './OpinionDetailModal';

interface IssueCommentsProps {
  issue: Issue;
  user: { id: string; name: string } | null;
  isReadOnly?: boolean; // 읽기 전용 모드 (완료된 티켓 등)
}

const IssueComments: React.FC<IssueCommentsProps> = ({ issue, user, isReadOnly = false }) => {
  const { addNotification, users } = useApp();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [showAddOpinionModal, setShowAddOpinionModal] = useState(false);
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [showOpinionDetailModal, setShowOpinionDetailModal] = useState(false);

  const handleAddOpinion = () => {
    setShowAddOpinionModal(true);
  };

  const handleSubmitOpinion = (text: string, files: File[]) => {
    if (!user) return;
    
    const newOpinion: Opinion = {
      id: Date.now().toString(),
      text: text.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date(),
      attachments: files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    setOpinions(prev => [...prev, newOpinion]);
    setShowAddOpinionModal(false);

    // 알림 전송: 티켓 참조자들에게 의견 추가 알림
    const notifyUsers = [
      issue.reporterId, // 생성자
      ...(issue.cc || []).map(cc => cc.id) // 참조자들
    ].filter(id => id !== user.id); // 작성자 제외

    notifyUsers.forEach(userId => {
      addNotification({
        type: 'OPINION_ADDED',
        title: '새로운 의견이 추가되었습니다',
        message: `${user.name}님이 "${issue.title}" 티켓에 의견을 남겼습니다.`,
        issueId: issue.id,
        issueTitle: issue.title,
        userId
      });
    });
  };

  const handleOpinionClick = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
    setShowOpinionDetailModal(true);
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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">의견</h3>
          {/* 의견 추가하기 버튼 (우상단) */}
          {!isReadOnly && (
            <button
              onClick={handleAddOpinion}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-water-blue-600 hover:text-water-blue-700 hover:bg-water-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>의견 추가하기</span>
            </button>
          )}
        </div>

        {/* 의견 목록 (스크롤 가능) */}
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

          {/* 의견 목록 */}
          {opinions.map(opinion => (
            <div key={opinion.id} className="flex space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {opinion.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div 
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleOpinionClick(opinion)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{opinion.authorName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(opinion.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1 whitespace-pre-line line-clamp-3">
                    {opinion.text}
                  </p>
                  {/* 첨부 파일 표시 */}
                  {opinion.attachments && opinion.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {opinion.attachments.map((attachment) => (
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
      </div>

      {/* 의견 추가 모달 */}
      {showAddOpinionModal && (
        <AddOpinionModal
          isOpen={showAddOpinionModal}
          onClose={() => {
            setShowAddOpinionModal(false);
          }}
          onSubmit={handleSubmitOpinion}
          user={user}
        />
      )}

      {/* 상세 의견 모달 */}
      {showOpinionDetailModal && selectedOpinion && (
        <OpinionDetailModal
          isOpen={showOpinionDetailModal}
          onClose={() => {
            setShowOpinionDetailModal(false);
            setSelectedOpinion(null);
          }}
          opinion={selectedOpinion}
          user={user}
        />
      )}
    </>
  );
};

export default IssueComments;
