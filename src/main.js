import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/darkmode.css';
import i18n from './i18n'; // Import the i18n instance

const app = createApp(App);

app.use(router);
app.use(i18n); // Use the i18n instance

app.mount('#app');
