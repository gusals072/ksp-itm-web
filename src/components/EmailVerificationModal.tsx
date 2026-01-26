import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  onVerify: (email: string, verificationCode: string) => Promise<boolean>;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onVerify
}) => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState(currentEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 사내 메일 도메인 체크 (mailplug 또는 ksmartpia.co.kr)
  const isValidCompanyEmail = (email: string) => {
    const companyDomains = ['@ksmartpia.com'];
    return companyDomains.some(domain => email.endsWith(domain));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!isValidCompanyEmail(email)) {
      setError('사내 메일(@ksmartpia.com)만 연동 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출 - 인증 이메일 전송
      // 임시로 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 실제로는 백엔드에서 인증 코드를 이메일로 전송
      // 여기서는 임시로 콘솔에 출력 (개발용)
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[개발용] 인증 코드: ${mockCode} (실제로는 ${email}로 전송됨)`);
      
      setStep('verify');
      setSuccess(false);
    } catch (err) {
      setError('인증 이메일 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('인증 코드는 6자리 숫자입니다.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출 - 인증 코드 검증 및 이메일 연동
      const result = await onVerify(email, verificationCode);
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // 상태 초기화
          setStep('email');
          setVerificationCode('');
          setError(null);
          setSuccess(false);
        }, 1500);
      } else {
        setError('인증 코드가 올바르지 않습니다. 다시 확인해주세요.');
      }
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // 상태 초기화
      setStep('email');
      setVerificationCode('');
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-water-blue-600" />
            이메일 연동
          </DialogTitle>
          <DialogDescription>
            사내 메일을 연동하여 알림을 받을 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사내 메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="example@ksmartpia.co.kr"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ksmartpia.com 도메인만 가능합니다.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="px-4 py-2 text-sm bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>인증 이메일 전송</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="verify-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifySubmit}
              className="space-y-4"
            >
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-800 mb-2">이메일 연동 완료!</p>
                  <p className="text-sm text-gray-600">{email}</p>
                </motion.div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      인증 코드
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                        setError(null);
                      }}
                      placeholder="6자리 숫자 입력"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-water-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {email}로 전송된 인증 코드를 입력해주세요.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setVerificationCode('');
                        setError(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      이전
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length !== 6}
                      className="px-4 py-2 text-sm bg-water-blue-600 text-white rounded-lg hover:bg-water-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>인증 중...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>인증 완료</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;

