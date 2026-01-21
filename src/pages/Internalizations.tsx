import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, FileText, User, Calendar, Lightbulb, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const Internalizations: React.FC = () => {
  const navigate = useNavigate();
  const { internalizations, issues, updateInternalization } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredInternalizations = internalizations.filter(internalization => {
    if (filterStatus === 'all') return true;
    return internalization.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '검토 중';
      case 'approved':
        return '내재화 승인';
      case 'rejected':
        return '내재화 거부';
      default:
        return status;
    }
  };

  const getIssue = (issueId: string) => {
    return issues.find(i => i.id === issueId);
  };

  const handleStatusChange = (internalizationId: string, newStatus: 'approved' | 'rejected', reason?: string) => {
    updateInternalization(internalizationId, newStatus, reason);
  };

  return (
    <div className="p-6">
      {/* 페이지 설명 */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="text-gray-600">해결된 이슈에 대한 내재화 검토 및 사후처리를 관리합니다.</p>
          {/* 내재화 절차 안내 정보 버튼 */}
          <div className="relative group">
            <button className="p-1.5 text-water-teal-600 hover:text-water-teal-700 hover:bg-water-teal-50 rounded-full transition-colors">
              <Info className="w-4 h-4" />
            </button>
            {/* 툴팁 */}
            <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              <div className="font-semibold mb-2 text-white">내재화 절차 안내</div>
              <ul className="space-y-1 text-gray-200">
                <li>• 해결된 이슈는 내재화 검토 대상으로 등록됩니다.</li>
                <li>• 검토 후 우수한 사례로 판단되면 전사적으로 확대 적용할 수 있습니다.</li>
                <li>• 거부된 사례는 추후 참고 자료로 활용됩니다.</li>
              </ul>
              {/* 화살표 */}
              <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 통계 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 필터 */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: '전체' },
              { value: 'pending', label: '검토 중' },
              { value: 'approved', label: '내재화 승인' },
              { value: 'rejected', label: '내재화 거부' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setFilterStatus(item.value as any)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === item.value
                    ? 'bg-water-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">총:</span>
              <span className="px-3 py-1 bg-gray-100 rounded-lg font-bold text-base">{internalizations.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <span className="font-semibold">검토:</span>
              <span className="px-3 py-1 bg-yellow-50 rounded-lg font-bold text-base">{internalizations.filter(i => i.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span className="font-semibold">승인:</span>
              <span className="px-3 py-1 bg-green-50 rounded-lg font-bold text-base">{internalizations.filter(i => i.status === 'approved').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-700">
              <span className="font-semibold">거부:</span>
              <span className="px-3 py-1 bg-red-50 rounded-lg font-bold text-base">{internalizations.filter(i => i.status === 'rejected').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 내재화 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInternalizations.map(internalization => {
          const issue = getIssue(internalization.issueId);
          return (
            <div
              key={internalization.id}
              className="bg-white rounded-lg border-2 border-water-teal-200 shadow-md hover:shadow-lg transition-all hover:border-water-teal-400 cursor-pointer flex flex-col"
              onClick={() => navigate(`/issues/${internalization.issueId}`)}
            >
              <div className="p-4 flex flex-col flex-1">
                {/* 티켓 스타일 헤더 */}
                <div className="mb-3 pb-3 border-b-2 border-water-teal-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-water-teal-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-water-teal-600" />
                    </div>
                    <span
                      className={`ml-2 px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(internalization.status)} flex-shrink-0`}
                    >
                      {getStatusText(internalization.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 hover:text-water-teal-600 transition-colors line-clamp-2 mb-1">{internalization.issueTitle}</h3>
                  {issue && (
                    <p className="text-xs text-gray-600 line-clamp-1">{issue.description}</p>
                  )}
                </div>

                {/* 티켓 정보 */}
                <div className="space-y-1.5 mb-3 flex-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <User className="w-3.5 h-3.5 text-water-teal-500 flex-shrink-0" />
                    <span className="font-medium truncate">검토자: {internalization.reviewerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-water-teal-500 flex-shrink-0" />
                    <span className="truncate">검토일: {format(new Date(internalization.reviewDate), 'yyyy-MM-dd', { locale: ko })}</span>
                  </div>
                  {issue && issue.resolvedDate && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <FileText className="w-3.5 h-3.5 text-water-teal-500 flex-shrink-0" />
                      <span className="truncate">해결일: {format(new Date(issue.resolvedDate), 'yyyy-MM-dd', { locale: ko })}</span>
                    </div>
                  )}
                  {internalization.reason && (
                    <div className="bg-water-teal-50 border-l-4 border-water-teal-300 rounded p-2 mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">검토 의견</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{internalization.reason}</p>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="pt-3 border-t-2 border-water-teal-100" onClick={(e) => e.stopPropagation()}>
                  {internalization.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const reason = prompt('승인 사유를 입력해주세요 (선택사항):', '우수한 사례로 판단되어 전사적으로 확대 적용합니다.');
                          if (reason !== null) {
                            handleStatusChange(internalization.id, 'approved', reason || '');
                          }
                        }}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>승인</span>
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('거부 사유를 입력해주세요:', '추후 참고 자료로 활용합니다.');
                          if (reason !== null) {
                            handleStatusChange(internalization.id, 'rejected', reason || '');
                          }
                        }}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>거부</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 완료 상태 표시 */}
                {internalization.status !== 'pending' && (
                  <div className="pt-3 border-t-2 border-water-teal-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {internalization.status === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-700 font-medium">
                        {internalization.status === 'approved' ? '내재화 완료' : '내재화 거부'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 결과 없음 */}
      {filteredInternalizations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">내재화 검토 대상이 없습니다</h3>
          <p className="text-gray-500">
            {filterStatus === 'all'
              ? '현재 검토 중인 내재화 대상이 없습니다.'
              : `선택한 상태('${getStatusText(filterStatus)}')의 내재화 대상이 없습니다.`}
          </p>
        </div>
      )}

    </div>
  );
};

export default Internalizations;
