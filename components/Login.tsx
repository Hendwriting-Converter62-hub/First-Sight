
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        if (email === 'bandarban62@gmail.com') {
             onNavigate('admin-dashboard');
        } else {
             onNavigate('profile');
        }
      } else {
        setError(t('login.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setForgotMessage(null);
    
    // Simulate reset logic with LocalStorage check
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.find((u: any) => u.email === email);
        
        setLoading(false);
        
        if (userExists) {
            setForgotMessage({
                type: 'success',
                text: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।'
            });
            setEmail('');
        } else {
             setForgotMessage({
                type: 'error',
                text: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।'
            });
        }
    }, 1500);
  };

  if (showForgot) {
      return (
        <div className="min-h-[calc(100vh-80px)] bg-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg relative">
                <button 
                    onClick={() => { setShowForgot(false); setForgotMessage(null); setEmail(''); setError(''); }}
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">পাসওয়ার্ড রিসেট</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন। আমরা আপনাকে পাসওয়ার্ড রিসেট করার নির্দেশনা পাঠাবো।
                    </p>
                </div>

                {forgotMessage && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${forgotMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {forgotMessage.type === 'success' ? <CheckCircle size={20} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />}
                        <p className="text-sm font-medium">{forgotMessage.text}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleForgotSubmit}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder={t('login.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold bg-primary hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => { setShowForgot(false); setForgotMessage(null); setEmail(''); }}
                            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                        >
                            লগইনে ফিরে যান
                        </button>
                    </div>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary fill-current" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{t('login.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('login.or')}{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t('login.createAccount')}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={t('login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={t('login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                {t('login.rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button"
                onClick={() => { setShowForgot(true); setError(''); setEmail(''); }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;