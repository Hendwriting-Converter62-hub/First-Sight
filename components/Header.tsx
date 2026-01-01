
import React, { useState } from 'react';
import { Heart, Menu, X, User as UserIcon, LogOut, MessageCircle, Globe, Shield, Users, Bell, Check, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin, acceptConnectionRequest, rejectConnectionRequest } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Get requester details for notifications
  const getRequesterDetails = (requesterId: string) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    return allUsers.find((u: any) => u.id === requesterId);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <Heart className="text-primary w-8 h-8 fill-current" />
            <h1 className="text-2xl font-bold text-primary">{t('common.appName')}</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => handleNavClick('home')} className={`font-medium transition-colors ${currentPage === 'home' ? 'text-primary' : 'text-dark hover:text-primary'}`}>{t('nav.home')}</button>
            <button onClick={() => handleNavClick('community')} className={`font-medium transition-colors ${currentPage === 'community' ? 'text-primary' : 'text-dark hover:text-primary'}`}>{t('nav.community')}</button>
            <button onClick={() => handleNavClick('features')} className="text-dark hover:text-primary font-medium transition-colors">{t('nav.features')}</button>
            <button onClick={() => handleNavClick('how-it-works')} className="text-dark hover:text-primary font-medium transition-colors">{t('nav.howItWorks')}</button>
            <button onClick={() => handleNavClick('pricing')} className="text-dark hover:text-primary font-medium transition-colors">{t('nav.pricing')}</button>
            
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Globe size={16} />
              <span className="text-sm font-medium uppercase">{language === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            <div className="flex gap-3 ml-2">
              {isAuthenticated && user ? (
                <>
                  {isAdmin && (
                    <button 
                      onClick={() => handleNavClick('admin-dashboard')} 
                      className="flex items-center gap-2 px-3 py-2 rounded-full font-semibold bg-dark text-white hover:bg-gray-800 transition-colors shadow-sm"
                      title="Admin Panel"
                    >
                      <Shield size={18} />
                      <span className="hidden lg:inline">Admin</span>
                    </button>
                  )}
                  
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)} 
                      className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}
                      title="Notifications"
                    >
                      <Bell size={24} />
                      {user.connectionRequests && user.connectionRequests.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                        <div className="p-3 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                          <span>নোটিফিকেশন</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.connectionRequests?.length || 0}</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {user.connectionRequests && user.connectionRequests.length > 0 ? (
                             user.connectionRequests.map(reqId => {
                               const requester = getRequesterDetails(reqId);
                               if (!requester) return null;
                               return (
                                 <div key={reqId} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-3 mb-2">
                                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                          {requester.profilePhoto ? (
                                            <img src={requester.profilePhoto} alt="" className="w-full h-full object-cover"/> 
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{requester.fullName[0]}</div>
                                          )}
                                       </div>
                                       <div>
                                          <p className="text-sm font-semibold text-gray-800">{requester.fullName}</p>
                                          <p className="text-xs text-gray-500">আপনাকে কানেকশন রিকোয়েস্ট পাঠিয়েছে</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-2 pl-12">
                                       <button 
                                         onClick={() => acceptConnectionRequest(reqId)}
                                         className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-dark transition-colors"
                                       >
                                         Confirm
                                       </button>
                                       <button 
                                         onClick={() => rejectConnectionRequest(reqId)}
                                         className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 transition-colors"
                                       >
                                         Delete
                                       </button>
                                    </div>
                                 </div>
                               );
                             })
                           ) : (
                             <div className="p-8 text-center text-gray-500 text-sm">
                               কোনো নতুন নোটিফিকেশন নেই
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleNavClick('chat')} 
                    className={`p-2 rounded-full relative transition-colors ${currentPage === 'chat' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}
                    title={t('nav.messages')}
                  >
                    <MessageCircle size={24} />
                    {/* Simplified badge for demo */}
                  </button>
                  <button 
                    onClick={() => handleNavClick('profile')} 
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <UserIcon size={20} />
                    )}
                    <span>{user.fullName.split(' ')[0]}</span>
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      handleNavClick('home');
                    }} 
                    className="p-2 rounded-full text-gray-500 hover:text-danger hover:bg-danger/10 transition-colors"
                    title={t('nav.logout')}
                  >
                    <LogOut size={24} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavClick('login')} 
                    className="px-5 py-2 rounded-full font-semibold text-primary border-2 border-primary hover:bg-primary/10 transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                  <button 
                    onClick={() => handleNavClick('register')} 
                    className="px-5 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    {t('nav.register')}
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-dark focus:outline-none flex items-center gap-4" onClick={toggleMenu}>
             <button 
              onClick={(e) => { e.stopPropagation(); toggleLanguage(); }} 
              className="flex items-center gap-1 px-2 py-1 rounded text-gray-600 border border-gray-200"
            >
              <Globe size={16} />
              <span className="text-xs font-bold uppercase">{language === 'bn' ? 'EN' : 'BN'}</span>
            </button>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 shadow-lg absolute w-full left-0 top-[72px] z-[55]">
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => handleNavClick('home')} className="text-dark hover:text-primary font-medium">{t('nav.home')}</button>
            <button onClick={() => handleNavClick('community')} className="text-dark hover:text-primary font-medium">{t('nav.community')}</button>
            <button onClick={() => handleNavClick('features')} className="text-dark hover:text-primary font-medium">{t('nav.features')}</button>
            <button onClick={() => handleNavClick('how-it-works')} className="text-dark hover:text-primary font-medium">{t('nav.howItWorks')}</button>
            <button onClick={() => handleNavClick('pricing')} className="text-dark hover:text-primary font-medium">{t('nav.pricing')}</button>
            
            <div className="w-full h-px bg-gray-100 my-2"></div>
            
            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <button 
                    onClick={() => handleNavClick('admin-dashboard')}
                    className="px-5 py-2 rounded-full font-semibold bg-dark text-white hover:bg-gray-800 w-3/4 text-center flex items-center justify-center gap-2"
                  >
                    <Shield size={18} />
                    Admin Panel
                  </button>
                )}
                {/* Mobile Notification Button */}
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="px-5 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-50 w-3/4 text-center flex items-center justify-center gap-2 relative"
                >
                  <Bell size={18} />
                  নোটিফিকেশন
                  {user.connectionRequests && user.connectionRequests.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{user.connectionRequests.length}</span>
                  )}
                </button>

                {isNotifOpen && (
                   <div className="w-3/4 bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto">
                       {user.connectionRequests && user.connectionRequests.length > 0 ? (
                           user.connectionRequests.map(reqId => (
                               <div key={reqId} className="bg-white p-2 mb-2 rounded shadow-sm text-sm">
                                  <p className="font-bold mb-1">New Connection Request</p>
                                  <div className="flex gap-2">
                                     <button onClick={() => acceptConnectionRequest(reqId)} className="bg-primary text-white px-2 py-1 rounded text-xs">Accept</button>
                                     <button onClick={() => rejectConnectionRequest(reqId)} className="bg-gray-200 text-dark px-2 py-1 rounded text-xs">Reject</button>
                                  </div>
                                </div>
                           ))
                       ) : (
                          <div className="text-center text-xs text-gray-500 p-2">No new notifications</div>
                       )}
                   </div>
                )}

                <button 
                  onClick={() => handleNavClick('chat')}
                  className="px-5 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-50 w-3/4 text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  {t('nav.messages')} (১)
                </button>
                <button 
                  onClick={() => handleNavClick('profile')}
                  className="px-5 py-2 rounded-full font-semibold bg-primary/10 text-primary w-3/4 text-center flex items-center justify-center gap-2"
                >
                  <UserIcon size={18} />
                  {t('nav.profile')}
                </button>
                <button 
                  onClick={() => {
                    logout();
                    handleNavClick('home');
                  }}
                  className="px-5 py-2 rounded-full font-semibold text-danger border border-danger hover:bg-danger/10 w-3/4 text-center flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNavClick('login')}
                  className="px-5 py-2 rounded-full font-semibold text-primary border-2 border-primary hover:bg-primary/10 w-3/4 text-center"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => handleNavClick('register')}
                  className="px-5 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary-dark w-3/4 text-center"
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
