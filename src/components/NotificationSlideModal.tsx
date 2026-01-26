import React from 'react';
import { Bell, X, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Notification, NotificationType } from '../types';

interface NotificationSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationSlideModal: React.FC<NotificationSlideModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'OPINION_ADDED':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'STATUS_CHANGED':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'TICKET_CREATED':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'OPINION_ADDED':
        return 'bg-blue-50 border-blue-200';
      case 'STATUS_CHANGED':
        return 'bg-yellow-50 border-yellow-200';
      case 'TICKET_CREATED':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-water-blue-600 to-water-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5" />
                  <div>
                    <h2 className="text-lg font-semibold">알림</h2>
                    {unreadCount > 0 && (
                      <p className="text-sm text-white/80">
                        읽지 않은 알림 {unreadCount}개
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      모두 읽음
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500">알림이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                        ${!notification.read ? 'bg-water-blue-50/50 border-water-blue-200' : 'border-gray-200'}
                        border-l-4 ${getNotificationColor(notification.type).split(' ')[1]}
                      `}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                        }
                        onNotificationClick(notification);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.issueTitle && (
                                <p className="text-xs text-water-blue-600 mt-1 truncate">
                                  티켓: {notification.issueTitle}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {format(new Date(notification.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-water-blue-600 rounded-full flex-shrink-0 mt-1 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSlideModal;

