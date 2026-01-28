import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Archive,
  User,
  Droplets,
  LogOut,
  Users,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useApp();

  const navItems = [
    {
      title: '대시보드',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: '이슈 목록',
      path: '/issues',
      icon: FileText
    },
    {
      title: '회의 안건',
      path: '/meetings',
      icon: Calendar
    },
    {
      title: '완료된 티켓',
      path: '/internalizations',
      icon: Archive
    }
  ];

  // 총괄 관리자 전용 메뉴
  const adminNavItems = user?.role === 'super_admin' ? [
    {
      title: '유저 관리',
      path: '/admin/users',
      icon: Users
    },
    {
      title: '사이트 관리',
      path: '/admin/site',
      icon: Settings
    }
  ] : [];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="hidden md:flex w-64 bg-gradient-to-b from-water-blue-900 to-water-blue-950 text-white h-screen fixed left-0 top-0 flex-col shadow-xl z-40">
      {/* 로고 */}
      <div className="p-6 border-b border-water-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-water-blue-400 to-water-teal-400 rounded-lg flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">K-SMARTPIA</h1>
            <p className="text-xs text-water-blue-300">TICKET MANAGEMENT SYSTEM</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              isActive(item.path)
                ? 'bg-water-blue-700 text-white shadow-lg'
                : 'text-water-blue-100 hover:bg-water-blue-800'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-water-teal-300' : 'text-water-blue-400 group-hover:text-water-teal-300'}`} />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}

        {/* 총괄 관리자 전용 메뉴 */}
        {adminNavItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-water-blue-400 uppercase tracking-wider">
                관리
              </div>
            </div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? 'bg-water-blue-700 text-white shadow-lg'
                    : 'text-water-blue-100 hover:bg-water-blue-800'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-water-teal-300' : 'text-water-blue-400 group-hover:text-water-teal-300'}`} />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* 사용자 정보 */}
      <div className="p-4 border-t border-water-blue-800">
        <div className="bg-water-blue-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-water-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-water-blue-300 truncate">{user?.department}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 text-sm text-water-blue-200 hover:text-white hover:bg-water-blue-700 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
