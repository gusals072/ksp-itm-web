import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Priority, Rank, RankLabel } from '../types';
import { ArrowLeft, Save, X, Plus, Tag as TagIcon, Image as ImageIcon, Upload } from 'lucide-react';

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user, addIssue } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    category: '',
    tags: [] as string[],
    readLevel: Rank.SAWON
  });

  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string }>({});

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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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
      assigneeId: '', // 담당자는 추후 배정
      assigneeName: '',
      cc: [], // 참조자는 추후 배정
      readLevel: formData.readLevel
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

        {/* 이미지 첨부 (UI만) */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            이미지 첨부
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-water-blue-500 transition-colors">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setImages(Array.from(e.target.files));
                }
              }}
            />
            <label
              htmlFor="images"
              className="cursor-pointer block"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-base text-gray-600 mb-1">이미지를 드래그하거나 클릭하여 업로드하세요</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF (최대 10MB)</p>
            </label>

            {/* 업로드된 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {image.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== idx));
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      X
                    </button>
                    <p className="mt-1 text-xs text-gray-500 truncate">{image.name}</p>
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



        {/* 열람 권한 */}
        <div className="mb-8">
          <label htmlFor="readLevel" className="block text-lg font-semibold text-gray-700 mb-2">
            열람 권한
          </label>
          <select
            id="readLevel"
            name="readLevel"
            value={formData.readLevel}
            onChange={handleInputChange}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none bg-white"
          >
            {Object.entries(RankLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label} 이상
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            이슈는 지정된 직급 이상의 사용자만 볼 수 있습니다.
          </p>
        </div>

        {/* 태그 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            태그
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1 relative">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그 입력 후 Enter 또는 추가 버튼 클릭"
                className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-water-blue-100 text-water-blue-700 rounded-lg hover:bg-water-blue-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 태그 목록 */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-water-blue-50 text-water-blue-700 rounded-full text-base"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-water-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

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
