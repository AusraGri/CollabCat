import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: MainLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: 'write-article',
          name: 'WriteArticle',
          component: () => import('../views/CreateTask.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },

    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: '/profile',
          name: 'Article',
          component: () => import('../views/ArticleView.vue'),
        },
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
        {
          path: '/intro',
          name: 'intro',
          component: () => import('../views/MainView.vue'),
        },
        {
          path: '/tasks',
          name: 'tasks',
          component: () => import('../views/TasksView.vue'),
        },
        {
          path: '/callback', // Define the callback route
          name: 'callback',
          component: () => import('../views/CallbackView.vue'), // Use a Callback component or handle it directly here
        },
      ],
    },
  ],
})

export default router
