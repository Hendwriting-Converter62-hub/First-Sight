
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProfiles from './components/FeaturedProfiles';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import RegistrationForm from './components/RegistrationForm';
import Login from './components/Login';
import Profile from './components/Profile';
import Chat from './components/Chat';
import AdminDashboard from './components/AdminDashboard';
import CommunityFeed from './components/CommunityFeed';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CommunityProvider } from './contexts/CommunityContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const { user, isAdmin } = useAuth();

  const navigateTo = (view: string) => {
    // Handle anchor links for home page sections
    if (['features', 'how-it-works', 'pricing'].includes(view)) {
      if (currentView !== 'home') {
        setCurrentView('home');
        // Wait for render then scroll
        setTimeout(() => {
          const element = document.getElementById(view);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(view);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onNavigate={navigateTo} />;
      case 'register':
        return <RegistrationForm onNavigate={navigateTo} />;
      case 'profile':
        return <Profile />;
      case 'chat':
        return <Chat />;
      case 'community':
        return <CommunityFeed />;
      case 'admin-dashboard':
        // Protect the admin route
        return isAdmin ? <AdminDashboard onNavigate={navigateTo} /> : <Login onNavigate={navigateTo} />;
      case 'home':
      default:
        return (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100">
              {/* Pass navigateTo to Hero to make the button work */}
              <div onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('a[href="#register"]')) {
                  e.preventDefault();
                  navigateTo('register');
                }
              }}>
                <Hero />
              </div>
            </div>
            <FeaturedProfiles />
            <Features />
            <HowItWorks />
            <Pricing onNavigate={navigateTo} />
          </>
        );
    }
  };

  // Hide header and footer for admin dashboard to provide full screen app feel
  const isFullScreen = currentView === 'admin-dashboard' && isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      {!isFullScreen && <Header onNavigate={navigateTo} currentPage={currentView} />}
      <main className="flex-grow">
        {renderView()}
      </main>
      {!isFullScreen && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CommunityProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </CommunityProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
