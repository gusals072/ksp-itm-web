import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from './context/AppContext';
import { ReactQueryProvider } from './lib/ReactQueryProvider';
import { store } from './store/store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import MeetingAgendas from './pages/MeetingAgendas';
import Internalizations from './pages/Internalizations';
import UserManagement from './pages/UserManagement';
import SiteManagement from './pages/SiteManagement';
import { useApp } from './context/AppContext';

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 메인 레이아웃 컴포넌트
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/dashboard') return '대시보드';
    if (path === '/issues') return '이슈 목록';
    if (path === '/meetings') return '회의 안건';
    if (path === '/internalizations') return '완료된 티켓';
    if (path === '/admin/users') return '유저 관리';
    if (path === '/admin/site') return '사이트 관리';
    return 'K-SMARTPIA 이슈 티켓 매니지먼트 시스템';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title={getPageTitle()} />
        <main className="pt-16">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ReactQueryProvider>
      <Provider store={store}>
        <Router>
          <AppProvider>
            <Routes>
              {/* 로그인 페이지 */}
              <Route path="/login" element={<LoginPage />} />

              {/* 보호된 라우트 */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Navigate to="/dashboard" replace />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/issues"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <IssueList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/meetings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MeetingAgendas />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/internalizations"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Internalizations />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* 총괄 관리자 전용 라우트 */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/site"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SiteManagement />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 처리 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AppProvider>
        </Router>
      </Provider>
    </ReactQueryProvider>
  );
}

export default App;
