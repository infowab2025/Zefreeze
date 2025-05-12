export type Language = 'fr' | 'en';

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export interface Translations {
  [key: string]: Translation;
}