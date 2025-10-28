<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router';
import { computed, watch } from 'vue';
import { authService } from './services/auth';
import { useDarkMode } from './composables/useDarkMode';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { isDark, toggleDarkMode } = useDarkMode();
const { t, locale } = useI18n();

// Inline fallback translations
const fallback = {
  logo: "Marathoons",
  title: "Marathoons",
  races: "Races",
  my_groups: "My Groups",
  light_mode: "Switch to Light Mode",
  dark_mode: "Switch to Dark Mode",
  logout: "Logout"
};

// Safe translation function
const getTranslation = (key: string) => {
  try {
    const translated = t(key);
    if (translated === key || translated.includes('app.')) {
      const shortKey = key.replace('app.', '').replace('nav.', '').replace('theme_toggle.', '');
      return fallback[shortKey as keyof typeof fallback] || key;
    }
    return translated;
  } catch {
    const shortKey = key.replace('app.', '').replace('nav.', '').replace('theme_toggle.', '');
    return fallback[shortKey as keyof typeof fallback] || key;
  }
};

const currentUser = computed(() => authService.getCurrentUser());
const isAuthenticated = computed(() => authService.isAuthenticated());
const showNav = computed(() => route.path !== '/login' && route.path !== '/register');
watch(locale, () => {
  document.title = getTranslation('app.title');
}, { immediate: true });

async function handleLogout() {
  await authService.logout();
  router.push('/login');
}
</script>

<template>
  <div id="app">
    <nav v-if="showNav" class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">{{ getTranslation('app.logo') }}</router-link>
        <div class="nav-links">
          <router-link to="/races" class="nav-link">{{ getTranslation('app.nav.races') }}</router-link>
          <router-link to="/groups" class="nav-link">{{ getTranslation('app.nav.my_groups') }}</router-link>
          <button @click="toggleDarkMode" class="theme-toggle" :title="isDark ? getTranslation('app.theme_toggle.light_mode') : getTranslation('app.theme_toggle.dark_mode')">
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
          <div v-if="isAuthenticated" class="user-section">
            <span class="user-name">{{ currentUser?.name }}</span>
            <button @click="handleLogout" class="logout-btn">{{ getTranslation('app.logout') }}</button>
          </div>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --bg-primary: #f5f7fa;
  --bg-secondary: white;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #ecf0f1;
  --shadow: rgba(0, 0, 0, 0.1);
  --shadow-heavy: rgba(0, 0, 0, 0.15);
}

:root.dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #eee;
  --text-secondary: #b8b8b8;
  --border-color: #2a2a4e;
  --shadow: rgba(0, 0, 0, 0.3);
  --shadow-heavy: rgba(0, 0, 0, 0.5);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--bg-secondary);
  box-shadow: 0 2px 4px var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #2980b9;
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.router-link-active {
  color: #3498db;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 3px;
  background: #3498db;
}

.theme-toggle {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  border-color: #3498db;
  transform: rotate(15deg) scale(1.1);
}

:root.dark .theme-toggle:hover {
  border-color: #f39c12;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--border-color);
}

.user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 8px 16px;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  background: transparent;
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-2px);
}

.main-content {
  flex: 1;
  padding: 0;
}
</style>
