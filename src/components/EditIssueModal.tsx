import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Priority, Rank } from '../types';
import { Save, X, Upload, Link as LinkIcon, Paperclip, File } from 'lucide-react';
import { AssigneeAssignment } from './AssigneeAssignment';
import RelatedIssuesModal from './RelatedIssuesModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  VisuallyHidden,
} from './ui/dialog';

interface EditIssueModalProps {
  issueId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 수정 성공 시 콜백
}

const EditIssueModal: React.FC<EditIssueModalProps> = ({ issueId, isOpen, onClose, onSuccess }) => {
  const { user, issues, updateIssue } = useApp();

  const issue = issues.find(i => i.id === issueId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    category: '',
    cc: [] as Array<{ id: string; name: string }>,
    readLevel: Rank.SAWON
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string }>({});
  const [selectedCC, setSelectedCC] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRelatedIssues, setSelectedRelatedIssues] = useState<string[]>([]);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [isRelatedIssuesModalOpen, setIsRelatedIssuesModalOpen] = useState(false);

  const categories = [
    '설비관리',
    '시스템개선',
    '안전관리',
    '품질관리',
    '시설확충',
    '데이터관리',
    '기타'
  ];

  // 이슈 데이터 로드
  useEffect(() => {
    if (issue && isOpen) {
      setFormData({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        category: issue.category,
        cc: issue.cc || [],
        readLevel: issue.readLevel
      });
      setSelectedCC(issue.cc || []);
      setSelectedRelatedIssues(issue.relatedIssues || []);
      setAttachments([]);
      setErrors({});
    }
  }, [issue, isOpen]);

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setAttachments([]);
      setErrors({});
      setIsAssigneeModalOpen(false);
      setIsRelatedIssuesModalOpen(false);
    }
  }, [isOpen]);

  if (!issue) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateIssue(issueId, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      cc: selectedCC,
      relatedIssues: selectedRelatedIssues.length > 0 ? selectedRelatedIssues : undefined
    });

    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (formData.title !== issue.title || formData.description !== issue.description) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto z-[10005] mx-2 md:mx-auto">
        <VisuallyHidden>
          <DialogTitle>이슈 수정</DialogTitle>
          <DialogDescription>이슈 정보를 수정하고 관리하세요.</DialogDescription>
        </VisuallyHidden>
        
        <div className="p-6">
          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">이슈 수정</h2>
            <p className="text-gray-600 mt-1">이슈 정보를 수정하고 관리하세요.</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="이슈 제목을 입력하세요"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="이슈에 대한 자세한 설명을 입력하세요"
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* 첨부 파일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Paperclip className="w-4 h-4 inline mr-2" />
                첨부 파일
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-water-blue-500 transition-colors">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer block"
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">파일을 드래그하거나 클릭하여 업로드하세요</p>
                  <p className="text-xs text-gray-400">모든 파일 형식 지원 (최대 10MB)</p>
                </label>

                {/* 업로드된 파일 목록 */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <File className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachments(attachments.filter((_, i) => i !== idx));
                          }}
                          className="ml-2 flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">* 실제 업로드 기능은 아직 구현되지 않았습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 우선순위 */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  우선순위
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value={Priority.LOW}>낮음</option>
                  <option value={Priority.MEDIUM}>보통</option>
                  <option value={Priority.HIGH}>높음</option>
                  <option value={Priority.URGENT}>긴급</option>
                </select>
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all bg-white ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* 참조자 배정 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                참조자 배정
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {selectedCC.length > 0 ? (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">참조자 ({selectedCC.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedCC.map((cc) => (
                            <span
                              key={cc.id}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              <span>{cc.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">참조자가 배정되지 않았습니다</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssigneeModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    참조자 추가
                  </button>
                </div>
              </div>
            </div>

            {/* 참조자 배정 모달 */}
            <AssigneeAssignment
              ticketId={issueId}
              currentAssignee={null}
              currentCC={selectedCC}
              onAssignmentChange={(assignee, cc) => {
                setSelectedCC(cc);
              }}
              isOpen={isAssigneeModalOpen}
              onClose={() => setIsAssigneeModalOpen(false)}
              allowAssigneeChange={false}
            />

            {/* 연관 이슈 링크 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                연관 이슈 링크
              </label>
              <p className="text-xs text-gray-500 mb-2">
                이 이슈와 관련된 다른 이슈를 연결할 수 있습니다.
              </p>
              <div className="space-y-2">
                {/* 선택된 이슈 표시 */}
                {selectedRelatedIssues.length > 0 && (
                  <div className="border-2 border-water-blue-200 rounded-lg p-3 bg-water-blue-50">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      선택된 연관 이슈 ({selectedRelatedIssues.length}개)
                    </p>
                    <div className="space-y-2">
                      {issues
                        .filter(issue => selectedRelatedIssues.includes(issue.id))
                        .map(issue => (
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
                              onClick={() => setSelectedRelatedIssues(prev => prev.filter(id => id !== issue.id))}
                              className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {/* 연관 이슈 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsRelatedIssuesModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-water-blue-400 hover:bg-water-blue-50 transition-colors text-gray-700"
                >
                  <LinkIcon className="w-4 h-4 text-water-blue-600" />
                  <span className="text-sm font-medium">연관 이슈 선택하기</span>
                </button>
              </div>
            </div>

            {/* 연관 이슈 선택 모달 */}
            <RelatedIssuesModal
              isOpen={isRelatedIssuesModalOpen}
              onClose={() => setIsRelatedIssuesModalOpen(false)}
              selectedIssues={selectedRelatedIssues}
              onSelectionChange={setSelectedRelatedIssues}
              allIssues={issues}
              currentUser={user}
              excludeIssueId={issueId}
            />

            {/* 버튼 그룹 */}
            <DialogFooter className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditIssueModal;
