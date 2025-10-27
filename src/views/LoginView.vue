<template>
    <div class="auth-view">
        <div class="auth-container">
            <div class="auth-card">
                <h1>{{ $t('login_view.welcome_back_title') }}</h1>
                <p class="subtitle">{{ $t('login_view.subtitle') }}</p>

                <form @submit.prevent="handleLogin" class="auth-form">
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div class="form-group">
                        <label for="email">{{ $t('login_view.email_label') }}</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            :placeholder="$t('login_view.email_placeholder')"
                            required
                            autocomplete="email"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">{{ $t('login_view.password_label') }}</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="$t('login_view.password_placeholder')"
                            required
                            autocomplete="current-password"
                        />
                    </div>

                    <button type="submit" class="btn-primary" :disabled="loading">
                        {{ loading ? $t('login_view.signing_in_button') : $t('login_view.sign_in_button') }}
                    </button>
                </form>

                <div class="auth-footer">
                    <p>{{ $t('login_view.dont_have_account') }} <router-link to="/register">{{ $t('login_view.sign_up_link') }}</router-link></p>
                </div>

                <div class="demo-credentials">
                    <p><strong>{{ $t('login_view.demo_accounts_title') }}</strong></p>
                    <p>{{ $t('login_view.demo_admin_credentials') }}</p>
                    <p>{{ $t('login_view.demo_user_credentials') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
    if (!email.value || !password.value) {
        error.value = t('login_view.error_fill_all_fields');
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await authService.login({
            email: email.value,
            password: password.value
        });

        // Redirect to home page after successful login
        router.push('/');
    } catch (err: any) {
        console.error('Login error:', err);
        error.value = err.response?.data?.error || t('login_view.error_login_failed');
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.auth-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-container {
    width: 100%;
    max-width: 450px;
}

.auth-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 2rem;
    text-align: center;
}

.subtitle {
    margin: 0 0 32px 0;
    color: #7f8c8d;
    text-align: center;
    font-size: 0.95rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
}

.form-group input {
    padding: 12px 16px;
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.error-message {
    padding: 12px 16px;
    background: #fee;
    border: 1px solid #e74c3c;
    border-radius: 8px;
    color: #c0392b;
    font-size: 0.9rem;
}

.btn-primary {
    padding: 14px;
    border: none;
    border-radius: 8px;
    background: #3498db;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.btn-primary:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
}

.auth-footer {
    margin-top: 24px;
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid #ecf0f1;
}

.auth-footer p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

.auth-footer a {
    color: #3498db;
    text-decoration: none;
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}

.demo-credentials {
    margin-top: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.demo-credentials p {
    margin: 4px 0;
}

.demo-credentials strong {
    color: #2c3e50;
}
</style>
