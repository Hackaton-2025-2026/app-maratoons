<template>
    <div class="auth-view">
        <div class="auth-container">
            <div class="auth-card">
                <h1>{{ $t('create_account_title') }}</h1>
                <p class="subtitle">{{ $t('subtitle') }}</p>

                <form @submit.prevent="handleRegister" class="auth-form">
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div class="form-group">
                        <label for="name">{{ $t('full_name_label') }}</label>
                        <input
                            id="name"
                            v-model="name"
                            type="text"
                            :placeholder="$t('full_name_placeholder')"
                            required
                            autocomplete="name"
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">{{ $t('email_label') }}</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            :placeholder="$t('email_placeholder')"
                            required
                            autocomplete="email"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">{{ $t('password_label') }}</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="$t('create_password_placeholder')"
                            required
                            autocomplete="new-password"
                            minlength="6"
                        />
                        <span class="hint">{{ $t('password_hint') }}</span>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">{{ $t('confirm_password_label') }}</label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            :placeholder="$t('confirm_password_placeholder')"
                            required
                            autocomplete="new-password"
                        />
                    </div>

                    <button type="submit" class="btn-primary" :disabled="loading">
                        {{ loading ? $t('creating_account_button') : $t('create_account_button') }}
                    </button>
                </form>

                <div class="auth-footer">
                    <p>{{ $t('already_have_account') }} <router-link to="/login">{{ $t('sign_in_link') }}</router-link></p>
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

// Inline fallback translations
const fallback = {
    create_account_title: "Create Account",
    subtitle: "Join Marathoons to start betting with friends",
    full_name_label: "Full Name",
    full_name_placeholder: "Enter your full name",
    email_label: "Email",
    email_placeholder: "Enter your email",
    password_label: "Password",
    create_password_placeholder: "Create a password",
    password_hint: "Minimum 6 characters",
    confirm_password_label: "Confirm Password",
    confirm_password_placeholder: "Confirm your password",
    creating_account_button: "Creating account...",
    create_account_button: "Create Account",
    already_have_account: "Already have an account?",
    sign_in_link: "Sign in",
    error_fill_all_fields: "Please fill in all fields",
    error_password_length: "Password must be at least 6 characters",
    error_passwords_match: "Passwords do not match",
    error_registration_failed: "Registration failed. Please try again."
};

// Safe translation function
const $t = (key: string) => {
    try {
        const translated = t(key);
        if (translated === key || translated.includes('register_view.')) {
            const shortKey = key.replace('register_view.', '');
            return fallback[shortKey as keyof typeof fallback] || key;
        }
        return translated;
    } catch {
        const shortKey = key.replace('register_view.', '');
        return fallback[shortKey as keyof typeof fallback] || key;
    }
};

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

async function handleRegister() {
    error.value = '';

    // Validation
    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
        error.value = $t('error_fill_all_fields');
        return;
    }

    if (password.value.length < 6) {
        error.value = $t('error_password_length');
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = $t('error_passwords_match');
        return;
    }

    loading.value = true;

    try {
        await authService.register({
            name: name.value,
            email: email.value,
            password: password.value
        });

        // Redirect to home page after successful registration
        router.push('/');
    } catch (err: any) {
        console.error('Registration error:', err);
        // Better error message handling
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
        error.value = errorMessage || $t('error_registration_failed');

        // Log detailed error for debugging
        if (err.response) {
            console.error('Response data:', err.response.data);
            console.error('Response status:', err.response.status);
        }
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

.hint {
    font-size: 0.85rem;
    color: #95a5a6;
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
</style>
