
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Step: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center max-w-[250px] mx-auto mb-8 lg:mb-0">
    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-5 shadow-lg relative z-10">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-3 text-primary-dark">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Use English numbers for English language, Bengali for Bengali
  const getNumber = (num: number) => {
    if (language === 'en') return num.toString();
    const bnNums = ['০', '১', '২', '৩', '৪'];
    return bnNums[num];
  };

  return (
    <section id="how-it-works" className="py-20 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">{t('howItWorks.title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-center items-start lg:gap-10 xl:gap-20">
          <Step 
            number={getNumber(1)}
            title={t('howItWorks.step1.title')}
            description={t('howItWorks.step1.desc')}
          />
          <Step 
            number={getNumber(2)}
            title={t('howItWorks.step2.title')}
            description={t('howItWorks.step2.desc')}
          />
          <Step 
            number={getNumber(3)}
            title={t('howItWorks.step3.title')}
            description={t('howItWorks.step3.desc')}
          />
          <Step 
            number={getNumber(4)}
            title={t('howItWorks.step4.title')}
            description={t('howItWorks.step4.desc')}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
