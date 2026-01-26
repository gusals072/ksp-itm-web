import React, { useRef, useEffect } from 'react';
import { Bell, X, MessageSquare, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Notification, NotificationType } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-[-13px] top-full mt-[-50px] w-100 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[60]"
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-water-blue-600 to-water-teal-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-bold">알림</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                  {unreadCount}개
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors relative z-[70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">알림이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      p-4 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!notification.read ? 'bg-water-blue-50/50' : ''}
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
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;

