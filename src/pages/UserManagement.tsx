import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { User, UserRole } from '../types';
import { Rank, RankLabel } from '../types';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const UserManagement: React.FC = () => {
  const { users, user: currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    name: '',
    email: '',
    department: '',
    role: 'user',
    rank: 'SAWON'
  });

  // 총괄 관리자만 접근 가능
  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-semibold">접근 권한이 없습니다.</p>
          <p className="text-red-500 text-sm mt-2">총괄 관리자만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      department: '',
      role: 'user',
      rank: 'SAWON'
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('자신의 계정은 삭제할 수 없습니다.');
      return;
    }
    if (confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      // TODO: 실제 삭제 로직 구현
      alert('삭제 기능은 백엔드 연동 후 구현됩니다.');
    }
  };

  const handleSave = () => {
    // TODO: 실제 저장 로직 구현
    if (isCreateModalOpen) {
      alert('생성 기능은 백엔드 연동 후 구현됩니다.');
    } else {
      alert('수정 기능은 백엔드 연동 후 구현됩니다.');
    }
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '총괄 관리자';
      case 'admin':
        return '관리자';
      case 'user':
        return '사용자';
      case 'guest':
        return '게스트';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'guest':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">유저 관리</h1>
              <p className="text-gray-600 mt-1">시스템 사용자 목록 및 관리</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 px-6 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>유저 추가</span>
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 사용자명, 이메일, 부서로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* 유저 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">사용자명</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이메일</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">부서</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">직급</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">권한</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{RankLabel[user.rank]}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-6 text-center text-lg text-gray-600 bg-white rounded-xl shadow-sm border border-gray-200 py-4">
          총 <span className="font-bold text-water-blue-600">{filteredUsers.length}</span>명의 사용자
        </div>
      </div>

      {/* 생성/수정 모달 */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {isCreateModalOpen ? '유저 추가' : '유저 수정'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사용자명 *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">부서 *</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">직급 *</label>
                <select
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value as Rank })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                >
                  {Object.entries(RankLabel).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">권한 *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-water-blue-500 outline-none"
                >
                  <option value="super_admin">총괄 관리자</option>
                  <option value="admin">관리자</option>
                  <option value="user">사용자</option>
                  <option value="guest">게스트</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-medium"
              >
                저장
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;

