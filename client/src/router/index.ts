import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import TasksView from '../views/TasksView.vue'
import { authenticate } from './guards'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/invite',
      name: 'Invite',
      component: () => import('../views/InvitationView.vue'),
    },
    {
      path: '',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/:username',
      component: UserLayout,
      beforeEnter: authenticate,
      children: [
        {
          path: ':group',
          name: 'Group',
          component: () => import('../layouts/GroupLayout.vue'),
          children: [
            {
              path: '',
              name: 'GroupPage',
              component: () => import('../views/GroupView.vue'),
            },
            {
              path: 'tasks',
              name: 'Tasks',
              component: TasksView
            },
            {
              path: 'calendar',
              name: 'Calendar',
              component: () => import('../views/CalendarView.vue'),
            },
            {
              path: 'grades',
              name: 'Grades',
              component: () => import('../views/GradesView.vue'),
            },
          ],
        },
        {
          path: '',
          name: 'Profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: '/callback',
          name: 'callback',
          component: () => import('../views/CallbackView.vue'),
        },
      ],
    },
  ],
})

export default router
