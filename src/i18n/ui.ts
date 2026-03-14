import en from './en.json';

export type TranslationKey = keyof typeof en;

export const languages = {
  en: 'English',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'en';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
} as const;
