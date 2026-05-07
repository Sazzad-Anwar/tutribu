import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from '../../public/locales/en/translation.json'
import esMXTranslation from '../../public/locales/es-MX/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      'es-MX': { translation: esMXTranslation },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es-MX'],
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'tutribu_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
