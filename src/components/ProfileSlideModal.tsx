import React, { useState, useRef } from 'react';
import { X, User, Mail, Building, Shield, Camera, Upload, Image as ImageIcon, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType, IssueStatus } from '../types';
import EmailVerificationModal from './EmailVerificationModal';

interface ProfileSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  userStats: {
    reported: number;
    assigned: number;
    inProgress: number;
    resolved: number;
  } | null;
  onUpdateLinkedEmail: (userId: string, email: string) => void;
}

const ProfileSlideModal: React.FC<ProfileSlideModalProps> = ({
  isOpen,
  onClose,
  user,
  userStats,
  onUpdateLinkedEmail
}) => {
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user ? localStorage.getItem(`profileImage_${user.id}`) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (user) {
      const savedImage = localStorage.getItem(`profileImage_${user.id}`);
      setProfileImage(savedImage);
    } else {
      setProfileImage(null);
    }
  }, [user]);

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

  const handleProfileImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageUploadModal(true);
  };

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

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-[9998]"
              onClick={onClose}
            />

            {/* 슬라이드 모달 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-water-blue-600 to-water-teal-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold relative overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
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
                        <Camera className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      <p className="text-sm text-white/80">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}
                  >
                    {getRoleText(user.role)}
                  </span>
                </div>
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
                <div className="p-6 border-b border-gray-200">
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

              {/* 이메일 연동 섹션 */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">이메일 연동</h4>
                <div className="space-y-3">
                  {user.linkedEmail ? (
                    <div className="flex items-center justify-between p-3 bg-water-blue-50 rounded-lg border border-water-blue-200">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Mail className="w-4 h-4 text-water-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">연동된 이메일</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{user.linkedEmail}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEmailVerificationModal(true)}
                        className="px-3 py-1.5 text-xs text-water-blue-600 hover:bg-water-blue-100 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>변경</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEmailVerificationModal(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>이메일 연동하기</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 프로필 이미지 업로드 모달 */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={() => setShowImageUploadModal(false)}>
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

      {/* 이메일 인증 모달 */}
      {user && (
        <EmailVerificationModal
          isOpen={showEmailVerificationModal}
          onClose={() => setShowEmailVerificationModal(false)}
          currentEmail={user.linkedEmail}
          onVerify={async (email: string, verificationCode: string) => {
            // TODO: 백엔드 API 호출 - 인증 코드 검증
            await new Promise(resolve => setTimeout(resolve, 1000));
            const isValid = verificationCode.length === 6;
            if (isValid) {
              onUpdateLinkedEmail(user.id, email);
              return true;
            }
            return false;
          }}
        />
      )}
    </>
  );
};

export default ProfileSlideModal;

