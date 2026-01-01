
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');

  // Load language preference from local storage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('appLanguage') as Language;
    if (storedLang && (storedLang === 'bn' || storedLang === 'en')) {
      setLanguage(storedLang);
    }
  }, []);

  // Save language preference when changed
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Bengali if translation missing
        let fallbackValue: any = translations['bn'];
        for (const fbK of keys) {
             if (fallbackValue && typeof fallbackValue === 'object' && fbK in fallbackValue) {
                fallbackValue = fallbackValue[fbK];
             } else {
                 return key; // Return key if not found in fallback either
             }
        }
        return fallbackValue || key;
      }
    }
    
    return value as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
