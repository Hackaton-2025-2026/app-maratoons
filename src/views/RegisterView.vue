<template>
    <div class="auth-view">
        <div class="auth-container">
            <div class="auth-card">
                <h1>Create Account</h1>
                <p class="subtitle">Join Marathoons to start betting with friends</p>

                <form @submit.prevent="handleRegister" class="auth-form">
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input
                            id="name"
                            v-model="name"
                            type="text"
                            placeholder="Enter your full name"
                            required
                            autocomplete="name"
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            autocomplete="email"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="Create a password"
                            required
                            autocomplete="new-password"
                            minlength="6"
                        />
                        <span class="hint">Minimum 6 characters</span>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            required
                            autocomplete="new-password"
                        />
                    </div>

                    <button type="submit" class="btn-primary" :disabled="loading">
                        {{ loading ? 'Creating account...' : 'Create Account' }}
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';

const router = useRouter();

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
        error.value = 'Please fill in all fields';
        return;
    }

    if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters';
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
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
        error.value = err.response?.data?.error || 'Registration failed. Please try again.';
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
