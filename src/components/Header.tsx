import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User, Mail, Building, Shield, X, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IssueStatus } from '../types';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, issues } = useApp();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user ? localStorage.getItem(`profileImage_${user.id}`) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 프로필 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && showImageUploadModal) {
        setShowImageUploadModal(false);
      }
    };

    if (showProfileDropdown || showImageUploadModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showImageUploadModal]);

  // 사용자 변경 시 프로필 이미지 로드
  useEffect(() => {
    if (user) {
      const savedImage = localStorage.getItem(`profileImage_${user.id}`);
      setProfileImage(savedImage);
    } else {
      setProfileImage(null);
    }
  }, [user]);

  // 사용자 통계 계산
  const userStats = user ? {
    reported: issues.filter(i => i.reporterId === user.id).length,
    assigned: issues.filter(i => i.assigneeId === user.id).length,
    inProgress: issues.filter(i => (i.reporterId === user.id || i.assigneeId === user.id) && i.status === IssueStatus.IN_PROGRESS).length,
    resolved: issues.filter(i => (i.reporterId === user.id || i.assigneeId === user.id) && i.status === IssueStatus.RESOLVED).length
  } : null;

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'manager':
        return '매니저';
      case 'user':
        return '사용자';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 프로필 이미지 업로드 처리
  const processFile = (file: File) => {
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setProfileImage(imageDataUrl);
        localStorage.setItem(`profileImage_${user.id}`, imageDataUrl);
        setShowImageUploadModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 프로필 이미지 클릭 시 모달 열기
  const handleProfileImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageUploadModal(true);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
      {/* 왼쪽: 제목과 메뉴 버튼 */}
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
      </div>

      {/* 오른쪽: 알림 및 프로필 */}
      <div className="flex items-center space-x-4">
        {/* 알림 */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 사용자 정보 및 프로필 드롭다운 */}
        <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{getRoleText(user?.role || '')}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="프로필" 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </button>

          {/* 프로필 드롭다운 */}
          {showProfileDropdown && user && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-water-blue-600 to-water-teal-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold relative overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
                      onClick={handleProfileImageClick}
                      title="프로필 사진 변경"
                    >
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="프로필" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-colors">
                        <Camera className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{user.name}</h3>
                      <p className="text-sm text-water-blue-100">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}
                >
                  {getRoleText(user.role)}
                </span>
              </div>


              {/* 상세 정보 */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">상세 정보</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-water-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">이름</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-water-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">이메일</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-water-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">부서</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-water-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">권한</p>
                      <p className="text-sm font-medium text-gray-800">{getRoleText(user.role)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 활동 통계 */}
              {userStats && (
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">활동 통계</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-water-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-water-blue-700">{userStats.reported}</p>
                      <p className="text-xs text-gray-500 mt-1">이슈 제기</p>
                    </div>
                    <div className="text-center p-4 bg-water-teal-50 rounded-lg">
                      <p className="text-2xl font-bold text-water-teal-700">{userStats.assigned}</p>
                      <p className="text-xs text-gray-500 mt-1">담당 이슈</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{userStats.inProgress}</p>
                      <p className="text-xs text-gray-500 mt-1">진행 중</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{userStats.resolved}</p>
                      <p className="text-xs text-gray-500 mt-1">완료됨</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 프로필 이미지 업로드 모달 */}
      {showImageUploadModal && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImageUploadModal(false)}>
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">프로필 사진 변경</h3>
              <button
                onClick={() => setShowImageUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-water-blue-500 bg-water-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-water-blue-400 hover:bg-gray-100'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-water-blue-100 rounded-full flex items-center justify-center">
                  {isDragging ? (
                    <Upload className="w-8 h-8 text-water-blue-600" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-water-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800 mb-1">
                    {isDragging ? '여기에 이미지를 놓으세요' : '드래그 앤 드롭 또는 클릭하여 파일 선택'}
                  </p>
                  <p className="text-sm text-gray-500">이미지 파일을 선택하거나 여기로 드래그하세요</p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
