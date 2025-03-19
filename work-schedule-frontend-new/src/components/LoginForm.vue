<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login to Work Schedule</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          placeholder="Enter your username"
          @keyup.enter="login"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Enter your password"
          @keyup.enter="login"
        />
      </div>
      
      <button 
        type="button" 
        class="login-button" 
        @click="login" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      
      <div class="register-link">
        Don't have an account? 
        <a href="#" @click.prevent="showRegisterForm">Register</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Form data
const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

// Login function
const login = async () => {
  if (!username.value || !password.value) {
    error.value = 'Username and password are required';
    return;
  }
  
  try {
    error.value = '';
    isLoading.value = true;
    
    await authStore.login(username.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.message || 'Failed to login. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};

// Show register form (you can implement this later)
const showRegisterForm = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  border-color: #4c6ef5;
  outline: none;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4c6ef5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.login-button:hover {
  background-color: #4263eb;
}

.login-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-link a {
  color: #4c6ef5;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>