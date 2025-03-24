import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../components/LoginForm.vue';
import Register from '../components/RegisterForm.vue';
import Dashboard from '../components/Dashboard.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: () => import('../components/workScheduleTable.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/daily-schedule',
    name: 'dailySchedule',
    component: () => import('../components/DailySchedule.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Add debugging to see what's happening
  console.log('Route navigation:', { 
    to: to.path, 
    isAuthenticated: authStore.isAuthenticated 
  });
  
  // If going to auth-required route but not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    next('/login');
  } 
  // If going to login/register but already authenticated
  else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard');
    next('/dashboard');
  }
  // Otherwise proceed normally
  else {
    next();
  }
});

export default router;