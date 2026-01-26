import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Issue, User } from '../types';
import DateIssuesSlideModal from './DateIssuesSlideModal';

interface CalendarProps {
  issues: Issue[];
  user: User | null;
}

const Calendar: React.FC<CalendarProps> = ({ issues, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const today = new Date();

  // 날짜별 이슈 개수 집계 (완료된 티켓 제외)
  const issuesByDate = useMemo(() => {
    const countMap: Record<string, number> = {};
    issues.forEach(issue => {
      // 완료된 티켓은 제외
      if (issue.status === 'RESOLVED') return;
      const dateKey = format(new Date(issue.createdAt), 'yyyy-MM-dd');
      countMap[dateKey] = (countMap[dateKey] || 0) + 1;
    });
    return countMap;
  }, [issues]);

  // 현재 월의 시작일과 종료일
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // 캘린더에 표시할 날짜들 (이전 달 마지막 주 + 현재 달 + 다음 달 첫 주)
  const calendarDays = useMemo(() => {
    const start = monthStart;
    const end = monthEnd;
    
    // 시작일이 일요일이 아니면 이전 달의 마지막 주를 포함
    const startDayOfWeek = getDay(start);
    const daysBefore = startDayOfWeek === 0 ? 0 : startDayOfWeek;
    
    // 종료일이 토요일이 아니면 다음 달의 첫 주를 포함
    const endDayOfWeek = getDay(end);
    const daysAfter = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
    
    const calendarStart = new Date(start);
    calendarStart.setDate(calendarStart.getDate() - daysBefore);
    
    const calendarEnd = new Date(end);
    calendarEnd.setDate(calendarEnd.getDate() + daysAfter);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [monthStart, monthEnd]);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜별 이슈 개수 가져오기
  const getIssueCount = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return issuesByDate[dateKey] || 0;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const issueCount = getIssueCount(date);
    if (issueCount > 0) {
      setSelectedDate(date);
      setIsSlideModalOpen(true);
    }
  };

  // 이슈 개수에 따른 색상 클래스
  const getCountColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 text-gray-400';
    if (count <= 2) return 'bg-blue-100 text-blue-800';
    if (count <= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // 주말 여부 확인
  const isWeekend = (date: Date): boolean => {
    const day = getDay(date);
    return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">이슈 캘린더</h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-medium text-water-blue-600 hover:bg-water-blue-50 rounded-md transition-colors"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h4 className="text-base font-semibold text-gray-800">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h4>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`p-2 text-center text-xs font-medium ${
              index === 0
                ? 'text-red-500'
                : index === 6
                ? 'text-blue-500'
                : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isToday = isSameDay(date, today);
          const issueCount = getIssueCount(date);
          const weekend = isWeekend(date);

          return (
            <motion.div
              key={date.toISOString()}
              className={`
                aspect-square p-1 border-r border-b border-gray-100
                ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                ${weekend && isCurrentMonth && !isToday ? 'bg-gray-50/50' : ''}
                ${isToday ? 'bg-water-blue-100 ring-2 ring-water-blue-400 ring-offset-1 shadow-md' : ''}
                ${issueCount > 0 ? 'hover:bg-water-blue-50 cursor-pointer' : 'cursor-default'}
                transition-colors
                flex flex-col items-center justify-center relative
                ${isToday ? 'z-10' : ''}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => handleDateClick(date)}
            >
              {/* 날짜 숫자 */}
              <span
                className={`
                  text-xs font-medium mb-0.5
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isToday ? 'text-water-blue-700 font-bold' : 'text-gray-700'}
                  ${weekend && isCurrentMonth && !isToday ? 'text-gray-500' : ''}
                `}
              >
                {format(date, 'd')}
              </span>
              
              {/* 오늘 표시 */}
              {isToday && (
                <span className="text-[8px] font-semibold text-water-blue-700 leading-none">
                  오늘
                </span>
              )}

              {/* 이슈 개수 배지 */}
              {issueCount > 0 && (
                <motion.span
                  className={`
                    ${getCountColor(issueCount)}
                    text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  `}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.01 + 0.1 }}
                >
                  {issueCount}개
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-100"></span>
            <span className="text-gray-600">1-2개</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-orange-100"></span>
            <span className="text-gray-600">3-5개</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-red-100"></span>
            <span className="text-gray-600">6개 이상</span>
          </div>
        </div>
      </div>

      {/* 날짜별 이슈 슬라이드 모달 */}
      <DateIssuesSlideModal
        isOpen={isSlideModalOpen}
        onClose={() => {
          setIsSlideModalOpen(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
        issues={issues}
        currentUser={user}
      />
    </motion.div>
  );
};

export default Calendar;

