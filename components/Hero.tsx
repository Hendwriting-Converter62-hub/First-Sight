
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-blue-100 text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-dark mb-4 leading-tight">
            {t('hero.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t('hero.description')}
          </p>
          <div className="mb-12">
            <a 
              href="#register" 
              className="inline-block px-8 py-3 rounded-full bg-primary text-white text-lg font-semibold shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              {t('hero.cta')}
            </a>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-10">
            <div className="text-center p-2 min-w-[120px]">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">১০,০০০+</div>
              <div className="text-sm md:text-base text-gray-500">{t('hero.statMatches')}</div>
            </div>
            <div className="text-center p-2 min-w-[120px]">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">৫০,০০০+</div>
              <div className="text-sm md:text-base text-gray-500">{t('hero.statMembers')}</div>
            </div>
            <div className="text-center p-2 min-w-[120px]">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">৮৫%</div>
              <div className="text-sm md:text-base text-gray-500">{t('hero.statSatisfaction')}</div>
            </div>
            <div className="text-center p-2 min-w-[120px]">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">১২+</div>
              <div className="text-sm md:text-base text-gray-500">{t('hero.statCountries')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;