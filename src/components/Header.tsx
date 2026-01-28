import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IssueStatus } from '../types';
import NotificationSlideModal from './NotificationSlideModal';
import ProfileSlideModal from './ProfileSlideModal';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const { 
    user, 
    issues, 
    notifications, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateUserLinkedEmail
  } = useApp();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);



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


  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 shadow-sm z-50">
      {/* 왼쪽: 제목과 메뉴 버튼 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-base md:text-xl font-bold text-gray-800 truncate">{title}</h1>
        </div>
      </div>

      {/* 오른쪽: 알림 및 프로필 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* 알림 */}
        <button
          onClick={() => setShowNotificationModal(true)}
          className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          {user && notifications.filter(n => n.userId === user.id && !n.read).length > 0 && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        {user && (
          <NotificationSlideModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            notifications={notifications.filter(n => n.userId === user.id).sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )}
            unreadCount={notifications.filter(n => n.userId === user.id && !n.read).length}
            onNotificationClick={(notification) => {
              if (notification.issueId) {
                navigate(`/issues`);
                // TODO: 이슈 상세 모달 열기
              }
              setShowNotificationModal(false);
            }}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
          />
        )}

        {/* 사용자 정보 및 프로필 */}
        <div className="pl-2 md:pl-4 border-l border-gray-200">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{getRoleText(user?.role || '')}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden text-sm md:text-base">
              {user?.name.charAt(0)}
            </div>
          </button>
        </div>
      </div>

      {/* 프로필 슬라이드 모달 */}
      {user && (
        <ProfileSlideModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          userStats={userStats}
          onUpdateLinkedEmail={updateUserLinkedEmail}
        />
      )}
    </header>
  );
};

export default Header;
