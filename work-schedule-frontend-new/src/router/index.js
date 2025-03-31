import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../components/LoginForm.vue';
import Schedule from '../components/Schedule.vue'; // Add this import

const routes = [
  {
    path: '/',
    redirect: '/schedule'  // Changed to redirect to the new schedule page
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },


  // Add the new Schedule route
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
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
  else if ((to.path === '/login') && authStore.isAuthenticated) {
    console.log('Already authenticated, redirecting to schedule');
    next('/schedule');
  }
  // Otherwise proceed normally
  else {
    next();
  }
});

export default router;