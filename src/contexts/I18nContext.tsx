import React, { createContext, useContext, useState } from 'react';
import { Language, I18nContextType, Translations } from '../types/i18n';
import { translations } from '../i18n/translations';

const I18nContext = createContext<I18nContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};