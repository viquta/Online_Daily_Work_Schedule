import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  
  // Base API URL (same as in your testpage.html)
  const API_URL = 'http://localhost:3001/api';
  
  // Login function
  async function login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      user.value = data.user;
      isAuthenticated.value = true;
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Logout function
  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      user.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
  
  // Get current user function
  async function getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          user.value = null;
          isAuthenticated.value = false;
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      
      const data = await response.json();
      user.value = data;
      isAuthenticated.value = true;
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      user.value = null;
      isAuthenticated.value = false;
      return null;
    }
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    getCurrentUser
  };
});