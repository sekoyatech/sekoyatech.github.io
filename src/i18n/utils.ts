import { translations, defaultLang, type Language, type TranslationKey } from './ui';

export function useTranslations(lang: Language = defaultLang) {
  return function t(key: TranslationKey): string {
    return translations[lang]?.[key] || translations[defaultLang][key] || key;
  };
}

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Language;
  return defaultLang;
}
