import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  const content = (
    <motion.div
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center max-w-md w-full">
        {/* 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </motion.div>

        {/* 404 텍스트 */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-7xl font-bold text-gray-800 mb-4"
        >
          404
        </motion.h1>

        {/* 메시지 */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3"
        >
          페이지를 찾을 수 없습니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 mb-8"
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          URL을 확인하시거나 {isAuthenticated ? '대시보드' : '로그인 페이지'}로 돌아가주세요.
        </motion.p>

        {/* 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              대시보드로 돌아가기
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              로그인 페이지로 돌아가기
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  // 인증된 경우 MainLayout 사용, 인증되지 않은 경우 단순 레이아웃
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-64">
          <main className="pt-14 md:pt-16">{content}</main>
        </div>
      </div>
    );
  }

  return content;
};

export default NotFound;
