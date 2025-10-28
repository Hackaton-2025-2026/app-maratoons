import { createI18n } from 'vue-i18n';

// Direct imports of translation files
import enMessages from './locales/en.json';
import frMessages from './locales/fr.json';

// IMPORTANT: Hardcode locale to 'en' to prevent minification issues
const FIXED_LOCALE = 'en';

// Create i18n instance - all components have their own inline fallbacks
const i18n = createI18n({
  locale: FIXED_LOCALE,
  fallbackLocale: 'en',
  legacy: true,
  globalInjection: true,
  messages: {
    en: enMessages,
    fr: frMessages
  },
  missingWarn: false,
  fallbackWarn: false
});

export default i18n;
