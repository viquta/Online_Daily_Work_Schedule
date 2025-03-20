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
  
  // If the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is already authenticated
    if (!authStore.isAuthenticated) {
      try {
        // Try to get current user session
        const user = await authStore.getCurrentUser();
        if (!user) {
          // Redirect to login if not authenticated
          return next({ name: 'Login', query: { redirect: to.fullPath } });
        }
      } catch (error) {
        return next({ name: 'Login', query: { redirect: to.fullPath } });
      }
    }
    
    // If route requires specific role
    if (to.meta.requiredRole && authStore.user?.role !== to.meta.requiredRole) {
      return next({ name: 'Unauthorized' });
    }
  }
  
  next();
});

export default router;