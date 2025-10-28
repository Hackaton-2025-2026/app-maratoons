import { createI18n } from 'vue-i18n';

// Direct JSON imports with import assertion for Vercel compatibility
import enMessages from './locales/en.json' assert { type: 'json' };
import frMessages from './locales/fr.json' assert { type: 'json' };

// Function to get browser language
function getBrowserLanguage() {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('fr')) {
    return 'fr';
  }
  // Default to English if not French or if no preference
  return 'en';
}

const detectedLocale = getBrowserLanguage();

// Create i18n instance with explicit configuration
const i18n = createI18n({
  locale: detectedLocale,
  fallbackLocale: 'en',
  legacy: false, // Use Composition API
  globalInjection: true, // Enable $t in templates
  messages: {
    en: enMessages,
    fr: frMessages
  },
  missingWarn: false, // Disable missing translation warnings in production
  fallbackWarn: false
});

export default i18n;
