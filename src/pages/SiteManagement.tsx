import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Database, Server, Shield, Bell, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const SiteManagement: React.FC = () => {
  const { user: currentUser } = useApp();

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

  const managementSections = [
    {
      title: '시스템 설정',
      icon: Settings,
      description: '시스템 전반의 설정을 관리합니다.',
      items: [
        '시스템 기본 정보',
        '사이트 이름 및 로고',
        '언어 설정',
        '테마 설정'
      ]
    },
    {
      title: '데이터베이스',
      icon: Database,
      description: '데이터베이스 백업 및 관리',
      items: [
        '데이터베이스 백업',
        '데이터베이스 복원',
        '데이터베이스 통계',
        '데이터 정리'
      ]
    },
    {
      title: '서버 관리',
      icon: Server,
      description: '서버 상태 및 모니터링',
      items: [
        '서버 상태 확인',
        '리소스 모니터링',
        '로그 관리',
        '성능 최적화'
      ]
    },
    {
      title: '보안 설정',
      icon: Shield,
      description: '보안 정책 및 접근 제어',
      items: [
        '비밀번호 정책',
        '세션 관리',
        'IP 차단 목록',
        '보안 로그'
      ]
    },
    {
      title: '알림 설정',
      icon: Bell,
      description: '알림 및 이메일 설정',
      items: [
        '이메일 서버 설정',
        '알림 템플릿',
        '알림 규칙',
        '알림 로그'
      ]
    },
    {
      title: '메일 연동',
      icon: Mail,
      description: '사내 메일 시스템 연동',
      items: [
        'Mailplug 연동 설정',
        '메일 발송 테스트',
        '메일 템플릿 관리',
        '메일 발송 로그'
      ]
    }
  ];

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">사이트 관리</h1>
            <p className="text-gray-600 mt-1">시스템 전반의 설정 및 관리</p>
            <p className="text-sm text-gray-500 mt-2">
              현재 이 페이지는 임시로 제작되었습니다. 실제 기능은 추후 구현 예정입니다.
            </p>
          </div>
        </div>

        {/* 관리 섹션 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementSections.map((section, index) => (
            <motion.div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-water-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-water-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-water-blue-400 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 w-full px-4 py-2 bg-water-blue-50 text-water-blue-700 rounded-lg hover:bg-water-blue-100 transition-colors text-sm font-medium"
                    onClick={() => alert(`${section.title} 기능은 추후 구현 예정입니다.`)}
                  >
                    설정 열기
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 시스템 정보 */}
        <motion.div
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">시스템 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">시스템 버전</p>
              <p className="text-base font-medium text-gray-800">K-SMARTPIA v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">마지막 업데이트</p>
              <p className="text-base font-medium text-gray-800">2026-01-15</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 사용자 수</p>
              <p className="text-base font-medium text-gray-800">-</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 이슈 수</p>
              <p className="text-base font-medium text-gray-800">-</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SiteManagement;

