
import React from 'react';
import { ShieldCheck, Bot, MessageCircle, Crown, Smartphone, UserCog } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-8 shadow-md border-t-4 border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-dark">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const Features: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">{t('features.title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck size={32} />}
            title={t('features.secureProfile.title')}
            description={t('features.secureProfile.desc')}
          />
          <FeatureCard 
            icon={<Bot size={32} />}
            title={t('features.aiMatching.title')}
            description={t('features.aiMatching.desc')}
          />
          <FeatureCard 
            icon={<MessageCircle size={32} />}
            title={t('features.secureChat.title')}
            description={t('features.secureChat.desc')}
          />
          <FeatureCard 
            icon={<Crown size={32} />}
            title={t('features.premiumService.title')}
            description={t('features.premiumService.desc')}
          />
          <FeatureCard 
            icon={<Smartphone size={32} />}
            title={t('features.mobileApp.title')}
            description={t('features.mobileApp.desc')}
          />
          <FeatureCard 
            icon={<UserCog size={32} />}
            title={t('features.adminPanel.title')}
            description={t('features.adminPanel.desc')}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
