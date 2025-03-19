import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginForm from '../components/LoginForm.vue';
import ScheduleLayout from '../components/ScheduleLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: ScheduleLayout,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // If route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (authStore.isAuthenticated) {
      next(); // Allow navigation
    } else {
      // Try to get current user
      try {
        const user = await authStore.getCurrentUser();
        if (user) {
          next(); // User is authenticated
        } else {
          next('/login'); // Redirect to login
        }
      } catch (error) {
        next('/login'); // Redirect to login on error
      }
    }
  } else {
    // If user is already authenticated and trying to access login
    if (authStore.isAuthenticated && to.path === '/login') {
      next('/dashboard'); // Redirect to dashboard
    } else {
      next(); // Allow navigation
    }
  }
});

export default router;