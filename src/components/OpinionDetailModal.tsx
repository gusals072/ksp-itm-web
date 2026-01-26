import React from 'react';
import { File, Download, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Opinion } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface OpinionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opinion: Opinion;
  user: { id: string; name: string } | null;
}

const OpinionDetailModal: React.FC<OpinionDetailModalProps> = ({ isOpen, onClose, opinion, user }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = (attachment: NonNullable<Opinion['attachments']>[0]) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else {
      // 실제 다운로드 기능은 백엔드 연동 시 구현
      alert(`파일 다운로드: ${attachment.name}\n(실제 다운로드 기능은 구현되지 않았습니다.)`);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('word') || type.includes('document')) return 'text-blue-500';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-500';
    if (type.includes('image')) return 'text-purple-500';
    return 'text-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto z-[10003]"
        >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="w-5 h-5 text-water-blue-600" />
            의견 상세
          </DialogTitle>
          <DialogDescription>
            의견의 상세 내용과 첨부 파일을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* 작성자 정보 */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {opinion.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-800">{opinion.authorName}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {format(new Date(opinion.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                  </span>
                </div>
              </div>
            </div>

            {/* 의견 내용 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">의견 내용</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {opinion.text}
                </p>
              </div>
            </div>

            {/* 첨부 파일 */}
            {opinion.attachments && opinion.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  첨부 파일 ({opinion.attachments.length}개)
                </h3>
                <div className="space-y-2">
                  {opinion.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 ${getFileIcon(attachment.type)}`}>
                          <File className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(attachment.size)} • {attachment.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="ml-4 flex-shrink-0 p-2 text-water-blue-600 hover:bg-water-blue-50 rounded-lg transition-colors"
                        title="다운로드"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {(!opinion.attachments || opinion.attachments.length === 0) && (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">첨부 파일이 없습니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpinionDetailModal;

