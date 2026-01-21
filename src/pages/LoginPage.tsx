import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Droplets } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-water-blue-50 to-water-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-water-blue-500 to-water-teal-500 rounded-full mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">K-SMARTPIA</h1>
          <p className="text-gray-600 text-sm">이슈 티켓 매니지먼트 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-water-blue-600 to-water-teal-600 text-white py-3 rounded-lg font-semibold hover:from-water-blue-700 hover:to-water-teal-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            로그인
          </button>
        </form>

        {/* 테스트 계정 정보 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-3">테스트 계정 (비밀번호: 모두 1234)</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <p>• admin (김대표)</p>
            <p>• isa (박이사)</p>
            <p>• sangmu (이상무)</p>
            <p>• bujang (정부장)</p>
            <p>• chajang (최차장)</p>
            <p>• gwajang (한과장)</p>
            <p>• daeri (조대리)</p>
            <p>• juim (권주임)</p>
            <p>• sawon (민사원)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
