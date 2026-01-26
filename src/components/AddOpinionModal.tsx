import React, { useState, useRef } from 'react';
import { Paperclip, Send, File, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AddOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, files: File[]) => void;
  user: { id: string; name: string } | null;
}

const AddOpinionModal: React.FC<AddOpinionModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const [opinionText, setOpinionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opinionText.trim() && attachedFiles.length === 0) return;
    
    onSubmit(opinionText, attachedFiles);
    setOpinionText('');
    setAttachedFiles([]);
  };

  const handleClose = () => {
    setOpinionText('');
    setAttachedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] z-[10000]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-water-blue-600" />
            의견 추가하기
          </DialogTitle>
          <DialogDescription>
            의견을 작성하고 첨부 파일을 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              의견 내용
            </label>
            <textarea
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              placeholder="의견을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none resize-none"
              rows={6}
            />
          </div>

          {/* 첨부된 파일 목록 */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                첨부 파일
              </label>
              <div className="space-y-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-3 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
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
                id="opinion-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">파일 첨부</span>
              </button>
              {attachedFiles.length > 0 && (
                <span className="text-xs text-gray-500">({attachedFiles.length}개)</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!opinionText.trim() && attachedFiles.length === 0}
              className="px-4 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              의견 등록
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOpinionModal;

