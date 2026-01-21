import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Issue, MeetingAgenda, Internalization, ClosedTicket } from '../types';
import { Priority, IssueStatus, Rank } from '../types';

interface AppContextType {
  // Auth
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;

  // Issues
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateIssue: (issueId: string, issueData: Partial<Issue>) => void;
  deleteIssue: (issueId: string) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus, closedReason?: string) => void;
  updateIssueAssignee: (issueId: string, assigneeId: string, assigneeName: string) => void;

  // Meeting Agendas
  meetingAgendas: MeetingAgenda[];
  addMeetingAgenda: (agenda: Omit<MeetingAgenda, 'id'>) => void;
  updateMeetingAgenda: (agendaId: string, status: MeetingAgenda['status'], notes?: string) => void;

  // Internalizations
  internalizations: Internalization[];
  addInternalization: (internalization: Omit<Internalization, 'id'>) => void;
  updateInternalization: (internalizationId: string, status: Internalization['status'], reason?: string) => void;

  // Closed Tickets (완료된 티켓 보관)
  closedTickets: ClosedTicket[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 더미 사용자 데이터
const dummyUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '김대표',
    email: 'admin@ksmartpia.co.kr',
    department: '경영기획팀',
    role: 'admin',
    rank: 'DAEPIO'
  },
  {
    id: '2',
    username: 'isa',
    name: '박이사',
    email: 'isa@ksmartpia.co.kr',
    department: '상하수도팀',
    role: 'manager',
    rank: 'ISA'
  },
  {
    id: '3',
    username: 'sangmu',
    name: '이상무',
    email: 'sangmu@ksmartpia.co.kr',
    department: '관리팀',
    role: 'manager',
    rank: 'SANGMU'
  },
  {
    id: '4',
    username: 'bujang',
    name: '정부장',
    email: 'bujang@ksmartpia.co.kr',
    department: '상하수도팀',
    role: 'manager',
    rank: 'BUJANG'
  },
  {
    id: '5',
    username: 'chajang',
    name: '최차장',
    email: 'chajang@ksmartpia.co.kr',
    department: '시설팀',
    role: 'user',
    rank: 'CHAJANG'
  },
  {
    id: '6',
    username: 'gwajang',
    name: '한과장',
    email: 'gwajang@ksmartpia.co.kr',
    department: '시스템팀',
    role: 'user',
    rank: 'GWAJANG'
  },
  {
    id: '7',
    username: 'daeri',
    name: '조대리',
    email: 'daeri@ksmartpia.co.kr',
    department: '상하수도팀',
    role: 'user',
    rank: 'DAERI'
  },
  {
    id: '8',
    username: 'juim',
    name: '권주임',
    email: 'juim@ksmartpia.co.kr',
    department: '시설팀',
    role: 'user',
    rank: 'JUIM'
  },
  {
    id: '9',
    username: 'sawon',
    name: '민사원',
    email: 'sawon@ksmartpia.co.kr',
    department: '상하수도팀',
    role: 'user',
    rank: 'SAWON'
  }
];

// 더미 이슈 데이터
const dummyIssues: Issue[] = [
  {
    id: '1',
    title: '상수도관 누수 감지 시스템 개선',
    description: '현재 사용 중인 감지 시스템의 센서 민감도가 낮아 누수 조기 탐지가 어렵습니다. 고민감도 센서로 교체 필요.',
    status: IssueStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    reporterId: '7',
    reporterName: '조대리',
    assigneeId: '7',
    assigneeName: '조대리',
    cc: [
      { id: '4', name: '정부장' },
      { id: '5', name: '최차장' }
    ],
    readLevel: 'DAERI',
    createdAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-01-08'),
    tags: ['설비', '센서', '개선'],
    category: '설비관리'
  },
  {
    id: '2',
    title: '주요 지역 수질 모니터링 보고서 자동화',
    description: '현재 수질 데이터를 엑셀로 매일 수동 입력하고 있습니다. 시스템과 연동하여 자동화가 필요합니다.',
    status: IssueStatus.MEETING,
    priority: Priority.MEDIUM,
    reporterId: '6',
    reporterName: '한과장',
    assigneeId: '6',
    assigneeName: '한과장',
    cc: [
      { id: '4', name: '정부장' },
      { id: '2', name: '박이사' }
    ],
    readLevel: 'GWAJANG',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-10'),
    meetingDate: new Date('2026-01-12'),
    tags: ['시스템', '보고서', '자동화'],
    category: '시스템개선'
  },
  {
    id: '3',
    title: '하수처리장 악취 제거 시설 추가',
    description: '인근 주민들의 민원이 증가하고 있습니다. 추가적인 악취 제거 시설 설치가 필요합니다.',
    status: IssueStatus.PENDING,
    priority: Priority.URGENT,
    reporterId: '8',
    reporterName: '권주임',
    cc: [
      { id: '5', name: '최차장' },
      { id: '4', name: '정부장' },
      { id: '3', name: '이상무' }
    ],
    readLevel: 'JUIM',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
    tags: ['민원', '악취', '시설'],
    category: '시설확충'
  },
  {
    id: '4',
    title: '관로 노후화 데이터베이스 구축',
    description: '전국 배수관망의 노후도를 체계적으로 관리할 수 있는 DB 구축이 필요합니다.',
    status: IssueStatus.RESOLVED,
    priority: Priority.MEDIUM,
    reporterId: '6',
    reporterName: '한과장',
    assigneeId: '6',
    assigneeName: '한과장',
    cc: [
      { id: '2', name: '박이사' }
    ],
    readLevel: 'GWAJANG',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-09'),
    resolvedDate: new Date('2026-01-09'),
    tags: ['데이터', '관로', '유지보수'],
    category: '데이터관리'
  }
];

// 더미 회의 안건 데이터
const dummyMeetingAgendas: MeetingAgenda[] = [
  {
    id: '1',
    issueId: '2',
    issueTitle: '주요 지역 수질 모니터링 보고서 자동화',
    status: 'pending',
    meetingDate: new Date('2026-01-12')
  }
];

// 더미 내재화 데이터
const dummyInternalizations: Internalization[] = [
  {
    id: '1',
    issueId: '4',
    issueTitle: '관로 노후화 데이터베이스 구축',
    reviewDate: new Date('2026-01-10'),
    reviewerId: '1',
    reviewerName: '김관리',
    status: 'approved',
    reason: '전국적으로 확대 적용 가능한 우수 사례'
  }
];

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>(dummyIssues);
  const [meetingAgendas, setMeetingAgendas] = useState<MeetingAgenda[]>(dummyMeetingAgendas);
  const [internalizations, setInternalizations] = useState<Internalization[]>(dummyInternalizations);
  const [closedTickets, setClosedTickets] = useState<ClosedTicket[]>([]);

  // 세션 복구
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 일주일 지난 이슈를 자동으로 회의 안건으로 이동
  useEffect(() => {
    const checkUnresolvedIssues = () => {
      const now = new Date();
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      setIssues(prevIssues => {
        const issuesToMoveToMeeting: Array<{ issueId: string; issueTitle: string }> = [];
        
        const updatedIssues = prevIssues.map(issue => {
          // 이미 해결되었거나 내재화 완료되었거나 회의 예정 상태이거나 취소된 이슈는 제외
          if (
            issue.status === IssueStatus.RESOLVED ||
            issue.status === IssueStatus.INTERNALIZED ||
            issue.status === IssueStatus.MEETING ||
            issue.status === IssueStatus.CANCELLED
          ) {
            return issue;
          }

          // 등록일로부터 일주일이 지났는지 확인
          const createdAt = new Date(issue.createdAt).getTime();
          const daysSinceCreation = (now.getTime() - createdAt) / oneWeekInMs;

          if (daysSinceCreation >= 1) {
            // 일주일이 지났으므로 회의 예정 상태로 변경
            issuesToMoveToMeeting.push({
              issueId: issue.id,
              issueTitle: issue.title
            });

            return {
              ...issue,
              status: IssueStatus.MEETING,
              updatedAt: now,
              meetingDate: now
            };
          }

          return issue;
        });

        // 회의 안건으로 추가할 이슈들이 있으면 추가
        if (issuesToMoveToMeeting.length > 0) {
          setMeetingAgendas(prevAgendas => {
            const newAgendas = issuesToMoveToMeeting
              .filter(({ issueId }) => !prevAgendas.find(a => a.issueId === issueId))
              .map(({ issueId, issueTitle }) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                issueId,
                issueTitle,
                status: 'pending' as const,
                meetingDate: now
              }));
            
            return [...prevAgendas, ...newAgendas];
          });
        }

        // 변경사항이 있는지 확인
        const hasChanges = updatedIssues.some((issue, index) => 
          issue.status !== prevIssues[index]?.status
        );

        return hasChanges ? updatedIssues : prevIssues;
      });
    };

    // 초기 체크
    checkUnresolvedIssues();

    // 매 시간마다 체크 (또는 더 자주 체크하려면 간격을 줄일 수 있음)
    const interval = setInterval(checkUnresolvedIssues, 60 * 60 * 1000); // 1시간마다

    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, _password: string): Promise<boolean> => {
    // 실제 백엔드 연동 시 API 호출
    // 현재는 더미 데이터 사용
    const foundUser = dummyUsers.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'cc' | 'readLevel'> & { cc?: Array<{ id: string; name: string }>; readLevel: Rank }) => {
    const newIssue: Issue = {
      ...issueData,
      id: Date.now().toString(),
      status: IssueStatus.PENDING,
      cc: issueData.cc || [],
      readLevel: issueData.readLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setIssues(prev => [newIssue, ...prev]);
  };

  // 티켓 종료 상태인지 확인
  const isClosedStatus = (status: IssueStatus): boolean => {
    return [
      IssueStatus.RESOLVED,
      IssueStatus.ON_HOLD,
      IssueStatus.BLOCKED,
      IssueStatus.CANCELLED
    ].includes(status);
  };

  // 티켓을 보관소에 추가하는 함수
  const archiveTicket = (issue: Issue, finalStatus: IssueStatus, closedReason?: string, source: 'issue' | 'meeting' = 'issue', meetingAgendaId?: string) => {
    setClosedTickets(prev => {
      // 이미 보관된 티켓인지 확인 (중복 방지)
      const existingTicket = prev.find(t => t.issueId === issue.id && t.finalStatus === finalStatus);
      if (existingTicket) {
        return prev; // 이미 보관된 경우 스킵
      }

      const closedTicket: ClosedTicket = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        issueId: issue.id,
        issueTitle: issue.title,
        issueDescription: issue.description,
        finalStatus,
        closedDate: new Date(),
        closedReason,
        source,
        priority: issue.priority,
        reporterId: issue.reporterId,
        reporterName: issue.reporterName,
        assigneeId: issue.assigneeId,
        assigneeName: issue.assigneeName,
        cc: issue.cc,
        category: issue.category,
        tags: issue.tags,
        createdAt: issue.createdAt,
        meetingAgendaId,
        meetingDate: issue.meetingDate
      };

      return [closedTicket, ...prev];
    });
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus, closedReason?: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const updatedIssue = {
          ...issue,
          status,
          updatedAt: new Date()
        };

        // 상태 변경에 따른 추가 처리
        if (status === IssueStatus.MEETING && !updatedIssue.meetingDate) {
          updatedIssue.meetingDate = new Date();
        }
        if (status === IssueStatus.RESOLVED && !updatedIssue.resolvedDate) {
          updatedIssue.resolvedDate = new Date();
        }

        // 회의 안건으로 추가
        if (status === IssueStatus.MEETING) {
          const existingAgenda = meetingAgendas.find(a => a.issueId === issueId);
          if (!existingAgenda) {
            setMeetingAgendas(prev => [...prev, {
              id: Date.now().toString(),
              issueId: issue.id,
              issueTitle: issue.title,
              status: 'pending',
              meetingDate: new Date()
            }]);
          }
        }

        // 종료 상태로 변경된 경우 티켓 보관
        if (isClosedStatus(status)) {
          archiveTicket(updatedIssue, status, closedReason, 'issue');
        }

        return updatedIssue;
      }
      return issue;
    }));
  };

  const updateIssueAssignee = (issueId: string, assigneeId: string, assigneeName: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          assigneeId,
          assigneeName,
          updatedAt: new Date()
        };
      }
      return issue;
    }));
  };

  const updateIssue = (issueId: string, issueData: Partial<Issue>) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          ...issueData,
          updatedAt: new Date()
        };
      }
      return issue;
    }));
  };

  const deleteIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
    // 관련된 회의 안건도 삭제
    setMeetingAgendas(prev => prev.filter(agenda => agenda.issueId !== issueId));
    // 관련된 내재화도 삭제
    setInternalizations(prev => prev.filter(internalization => internalization.issueId !== issueId));
  };

  const addMeetingAgenda = (agenda: Omit<MeetingAgenda, 'id'>) => {
    const newAgenda: MeetingAgenda = {
      ...agenda,
      id: Date.now().toString()
    };
    setMeetingAgendas(prev => [newAgenda, ...prev]);
  };

  const updateMeetingAgenda = (agendaId: string, status: MeetingAgenda['status'], notes?: string) => {
    const agenda = meetingAgendas.find(a => a.id === agendaId);
    if (agenda) {
      const issue = issues.find(i => i.id === agenda.issueId);
      if (issue) {
        // 회의 안건 상태에 따라 관련 이슈 상태도 업데이트
        if (status === 'resolved') {
          updateIssueStatus(agenda.issueId, IssueStatus.RESOLVED, notes);
          // 회의 안건에서 해결된 경우 티켓 보관 (중복 방지를 위해 직접 보관)
          if (isClosedStatus(IssueStatus.RESOLVED)) {
            archiveTicket(issue, IssueStatus.RESOLVED, notes, 'meeting', agendaId);
          }
        } else if (status === 'on_hold') {
          updateIssueStatus(agenda.issueId, IssueStatus.ON_HOLD, notes);
          // 회의 안건에서 보류된 경우 티켓 보관
          if (isClosedStatus(IssueStatus.ON_HOLD)) {
            archiveTicket(issue, IssueStatus.ON_HOLD, notes, 'meeting', agendaId);
          }
        }
      }
    }

    setMeetingAgendas(prev => prev.map(agenda => {
      if (agenda.id === agendaId) {
        return {
          ...agenda,
          status,
          notes
        };
      }
      return agenda;
    }));
  };

  const addInternalization = (internalization: Omit<Internalization, 'id'>) => {
    const newInternalization: Internalization = {
      ...internalization,
      id: Date.now().toString()
    };
    setInternalizations(prev => [newInternalization, ...prev]);
  };

  const updateInternalization = (internalizationId: string, status: Internalization['status'], reason?: string) => {
    setInternalizations(prev => prev.map(internalization => {
      if (internalization.id === internalizationId) {
        return {
          ...internalization,
          status,
          reason
        };
      }
      return internalization;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        issues,
        addIssue,
        updateIssue,
        deleteIssue,
        updateIssueStatus,
        updateIssueAssignee,
        meetingAgendas,
        addMeetingAgenda,
        updateMeetingAgenda,
        internalizations,
        addInternalization,
        updateInternalization,
        closedTickets
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
