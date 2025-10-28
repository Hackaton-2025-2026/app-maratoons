import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';

const messages = {
  en,
  fr
};

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

const i18n = createI18n({
  locale: detectedLocale, // set locale based on browser
  fallbackLocale: 'en', // set fallback locale to English
  messages, // set locale messages
  legacy: false, // you must set `false` to use Composition API
  globalInjection: true, // Allow global injection of $t, $tc, etc.
});

export default i18n;
