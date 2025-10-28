import { createI18n } from 'vue-i18n';

// Use Vite's import.meta.glob for proper bundling in production
// The { eager: true } option ensures translations are bundled at build time
const localeModules = import.meta.glob('./locales/*.json', { eager: true });

// Build messages object from loaded locale files
const messages: Record<string, any> = {};
for (const path in localeModules) {
  const matched = path.match(/\/locales\/([^/]+)\.json$/);
  if (matched && matched[1]) {
    const locale = matched[1];
    messages[locale] = (localeModules[path] as any).default;
  }
}

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
