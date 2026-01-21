import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Pause, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const MeetingAgendas: React.FC = () => {
  const navigate = useNavigate();
  const { meetingAgendas, updateMeetingAgenda, issues } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'discussed' | 'resolved' | 'on_hold'>('all');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [resolveReason, setResolveReason] = useState('');
  const [holdReason, setHoldReason] = useState('');

  const filteredAgendas = meetingAgendas.filter(agenda => {
    if (filterStatus === 'all') return true;
    return agenda.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'discussed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'discussed':
        return '논의 완료';
      case 'resolved':
        return '해결됨';
      case 'on_hold':
        return '보류됨';
      default:
        return status;
    }
  };

  const getIssueStatus = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    return issue?.status;
  };

  // 모달 닫기 핸들러
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResolveModal(false);
        setShowHoldModal(false);
        setResolveReason('');
        setHoldReason('');
        setSelectedAgendaId(null);
      }
    };

    if (showResolveModal || showHoldModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showResolveModal, showHoldModal]);

  // 해결 버튼 클릭
  const handleResolveClick = (agendaId: string) => {
    setSelectedAgendaId(agendaId);
    setResolveReason('');
    setShowResolveModal(true);
  };

  // 보류 버튼 클릭
  const handleHoldClick = (agendaId: string) => {
    setSelectedAgendaId(agendaId);
    setHoldReason('');
    setShowHoldModal(true);
  };

  // 해결 확인
  const handleResolveConfirm = () => {
    if (selectedAgendaId && resolveReason.trim()) {
      updateMeetingAgenda(selectedAgendaId, 'resolved', resolveReason.trim());
      setShowResolveModal(false);
      setResolveReason('');
      setSelectedAgendaId(null);
    }
  };

  // 보류 확인
  const handleHoldConfirm = () => {
    if (selectedAgendaId && holdReason.trim()) {
      updateMeetingAgenda(selectedAgendaId, 'on_hold', holdReason.trim());
      setShowHoldModal(false);
      setHoldReason('');
      setSelectedAgendaId(null);
    }
  };

  // 논의 완료 처리
  const handleDiscussed = (agendaId: string) => {
    updateMeetingAgenda(agendaId, 'discussed');
  };

  const selectedAgenda = selectedAgendaId ? meetingAgendas.find(a => a.id === selectedAgendaId) : null;

  return (
    <div className="p-6">

      {/* 필터 및 통계 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 필터 */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: '전체' },
              { value: 'pending', label: '대기 중' },
              { value: 'discussed', label: '논의 완료' },
              { value: 'resolved', label: '해결됨' },
              { value: 'on_hold', label: '보류됨' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setFilterStatus(item.value as any)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === item.value
                    ? 'bg-water-blue-600 text-white'
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
              <span className="px-3 py-1 bg-gray-100 rounded-lg font-bold text-base">{meetingAgendas.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <span className="font-semibold">대기:</span>
              <span className="px-3 py-1 bg-yellow-50 rounded-lg font-bold text-base">{meetingAgendas.filter(a => a.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span className="font-semibold">해결:</span>
              <span className="px-3 py-1 bg-green-50 rounded-lg font-bold text-base">{meetingAgendas.filter(a => a.status === 'resolved').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <span className="font-semibold">보류:</span>
              <span className="px-3 py-1 bg-orange-50 rounded-lg font-bold text-base">{meetingAgendas.filter(a => a.status === 'on_hold').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 회의 안건 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAgendas.map(agenda => {
          const issueStatus = getIssueStatus(agenda.issueId);
          return (
            <div
              key={agenda.id}
              className="bg-white rounded-lg border-2 border-purple-200 shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-purple-400 flex flex-col"
              onClick={() => navigate(`/issues/${agenda.issueId}`)}
            >
              <div className="p-4 flex flex-col flex-1">
                {/* 티켓 스타일 헤더 */}
                <div className="mb-3 pb-3 border-b-2 border-purple-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(agenda.status)} flex-shrink-0 ml-2`}
                    >
                      {getStatusText(agenda.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 hover:text-purple-600 transition-colors line-clamp-2">{agenda.issueTitle}</h3>
                </div>

                {/* 티켓 정보 */}
                <div className="space-y-1.5 mb-3 flex-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-medium truncate">{format(new Date(agenda.meetingDate), 'yyyy.MM.dd', { locale: ko })}</span>
                  </div>
                  {issueStatus && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <FileText className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <span className="truncate">상태: {issueStatus === 'RESOLVED' ? '해결됨' : issueStatus === 'MEETING' ? '회의 중' : issueStatus === 'ON_HOLD' ? '보류' : issueStatus}</span>
                    </div>
                  )}
                  {agenda.notes && (
                    <div className="bg-purple-50 border-l-4 border-purple-300 rounded p-2 mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        {agenda.status === 'resolved' ? '해결 방법' : agenda.status === 'on_hold' ? '보류 사유' : '메모'}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">{agenda.notes}</p>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="pt-3 border-t-2 border-purple-100" onClick={(e) => e.stopPropagation()}>
                  {agenda.status === 'pending' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDiscussed(agenda.id)}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                      >
                        <FileText className="w-3 h-3" />
                        <span>논의</span>
                      </button>
                      <button
                        onClick={() => handleResolveClick(agenda.id)}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>해결</span>
                      </button>
                      <button
                        onClick={() => handleHoldClick(agenda.id)}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium"
                      >
                        <Pause className="w-3 h-3" />
                        <span>보류</span>
                      </button>
                    </div>
                  )}

                  {agenda.status === 'discussed' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleResolveClick(agenda.id)}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>해결</span>
                      </button>
                      <button
                        onClick={() => handleHoldClick(agenda.id)}
                        className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium"
                      >
                        <Pause className="w-3 h-3" />
                        <span>보류</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 결과 없음 */}
      {filteredAgendas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">회의 안건이 없습니다</h3>
          <p className="text-gray-500">
            {filterStatus === 'all'
              ? '현재 예정된 회의 안건이 없습니다.'
              : `선택한 상태('${getStatusText(filterStatus)}')의 회의 안건이 없습니다.`}
          </p>
        </div>
      )}

      {/* 해결 방법 입력 모달 */}
      {showResolveModal && selectedAgenda && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setShowResolveModal(false);
            setResolveReason('');
            setSelectedAgendaId(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">해결 방법 입력</h3>
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveReason('');
                  setSelectedAgendaId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">안건: <span className="font-semibold text-gray-800">{selectedAgenda.issueTitle}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                해결 방법 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolveReason}
                onChange={(e) => setResolveReason(e.target.value)}
                placeholder="이슈를 해결한 방법을 입력해주세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent resize-none"
                rows={5}
                autoFocus
              />
              {resolveReason.trim().length === 0 && (
                <p className="text-xs text-red-500 mt-1">해결 방법을 입력해주세요.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveReason('');
                  setSelectedAgendaId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleResolveConfirm}
                disabled={!resolveReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 보류 사유 입력 모달 */}
      {showHoldModal && selectedAgenda && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setShowHoldModal(false);
            setHoldReason('');
            setSelectedAgendaId(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">보류 사유 입력</h3>
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  setHoldReason('');
                  setSelectedAgendaId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">안건: <span className="font-semibold text-gray-800">{selectedAgenda.issueTitle}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                보류 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="이슈를 보류하는 사유를 입력해주세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={5}
                autoFocus
              />
              {holdReason.trim().length === 0 && (
                <p className="text-xs text-red-500 mt-1">보류 사유를 입력해주세요.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  setHoldReason('');
                  setSelectedAgendaId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleHoldConfirm}
                disabled={!holdReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingAgendas;
