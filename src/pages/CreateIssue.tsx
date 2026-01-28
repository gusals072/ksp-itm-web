import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Priority, Rank, RankLabel } from '../types';
import { ArrowLeft, Save, X, Upload, User, Users, Link as LinkIcon, Paperclip, File } from 'lucide-react';
import { AssigneeAssignment } from '../components/AssigneeAssignment';
import RelatedIssuesModal from '../components/RelatedIssuesModal';

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user, addIssue, issues } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    category: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string }>({});
  const [selectedCC, setSelectedCC] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRelatedIssues, setSelectedRelatedIssues] = useState<string[]>([]);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [isRelatedIssuesModalOpen, setIsRelatedIssuesModalOpen] = useState(false);

  // 더미 사용자 목록 (실제로는 AppContext에서 가져와야 함)
  const dummyUsers = [
    { id: '1', name: '김대표', rank: 'DAEPIO' as Rank },
    { id: '2', name: '박이사', rank: 'ISA' as Rank },
    { id: '3', name: '이상무', rank: 'SANGMU' as Rank },
    { id: '4', name: '정부장', rank: 'BUJANG' as Rank },
    { id: '5', name: '최차장', rank: 'CHAJANG' as Rank },
    { id: '6', name: '한과장', rank: 'GWAJANG' as Rank },
    { id: '7', name: '조대리', rank: 'DAERI' as Rank },
    { id: '8', name: '권주임', rank: 'JUIM' as Rank },
    { id: '9', name: '민사원', rank: 'SAWON' as Rank }
  ];

  const categories = [
    '설비관리',
    '시스템개선',
    '안전관리',
    '품질관리',
    '시설확충',
    '데이터관리',
    '기타'
  ];

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

    // 실제 백엔드 연동 시 API 호출
    // 현재는 Context API 사용
    addIssue({
      ...formData,
      reporterId: user?.id || '',
      reporterName: user?.name || '',
      cc: selectedCC,
      readLevel: Rank.SAWON, // 하위 호환성을 위해 기본값 설정 (사용되지 않음)
      relatedIssues: selectedRelatedIssues.length > 0 ? selectedRelatedIssues : undefined
    });

    navigate('/issues');
  };

  const handleCancel = () => {
    if (formData.title || formData.description) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        navigate('/issues');
      }
    } else {
      navigate('/issues');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">새 이슈 등록</h2>
          <p className="text-gray-600 text-lg">새로운 이슈를 등록하고 관리하세요.</p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* 제목 */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="이슈 제목을 입력하세요"
            className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-red-500 text-base mt-1">{errors.title}</p>}
        </div>

        {/* 설명 */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-lg font-semibold text-gray-700 mb-2">
            설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="이슈에 대한 자세한 설명을 입력하세요"
            rows={6}
            className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-base mt-1">{errors.description}</p>}
        </div>

        {/* 첨부 파일 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            <Paperclip className="w-5 h-5 inline mr-2" />
            첨부 파일
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-water-blue-500 transition-colors">
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
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-base text-gray-600 mb-1">파일을 드래그하거나 클릭하여 업로드하세요</p>
              <p className="text-sm text-gray-400">모든 파일 형식 지원 (최대 10MB)</p>
            </label>

            {/* 업로드된 파일 목록 */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <File className="w-5 h-5 text-blue-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
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
                      className="ml-3 flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">* 실제 업로드 기능은 아직 구현되지 않았습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 우선순위 */}
          <div>
            <label htmlFor="priority" className="block text-lg font-semibold text-gray-700 mb-2">
              우선순위
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value={Priority.LOW}>낮음</option>
              <option value={Priority.MEDIUM}>보통</option>
              <option value={Priority.HIGH}>높음</option>
              <option value={Priority.URGENT}>긴급</option>
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-lg font-semibold text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all bg-white ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">카테고리 선택</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-base mt-1">{errors.category}</p>}
          </div>


        </div>





        {/* 참조자 배정 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            참조자 배정
          </label>
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {selectedCC.length > 0 ? (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">참조자 ({selectedCC.length})</div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                참조자 추가
              </button>
            </div>
          </div>
        </div>

        {/* 참조자 배정 모달 */}
        <AssigneeAssignment
          ticketId="new"
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
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            <LinkIcon className="w-5 h-5 inline mr-2" />
            연관 이슈 링크
          </label>
          <p className="text-sm text-gray-500 mb-3">
            이 이슈와 관련된 다른 이슈를 연결할 수 있습니다.
          </p>
          <div className="space-y-3">
            {/* 선택된 이슈 표시 */}
            {selectedRelatedIssues.length > 0 && (
              <div className="border-2 border-water-blue-200 rounded-lg p-3 bg-water-blue-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
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
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-water-blue-400 hover:bg-water-blue-50 transition-colors text-gray-700"
            >
              <LinkIcon className="w-5 h-5 text-water-blue-600" />
              <span className="font-medium">연관 이슈 선택하기</span>
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
        />

        {/* 버튼 그룹 */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-3 text-lg border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors text-lg font-semibold"
          >
            <Save className="w-5 h-5" />
            <span>등록</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;
