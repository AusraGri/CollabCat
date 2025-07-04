import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import TasksView from '../views/TasksView.vue'
import { authenticate } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/logout',
      name: 'Logout',
      component: () => import('../views/LogoutView.vue'),
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
      path: '/callback',
      name: 'callback',
      component: () => import('../views/CallbackView.vue'),
    },
    {
      path: '/:username',
      component: UserLayout,
      beforeEnter: authenticate,
      children: [
        {
          path: ':group',
          name: 'Group',
          children: [
            {
              path: 'tasks',
              name: 'Tasks',
              component: TasksView,
              meta: { group: true },
            },
            {
              path: 'calendar',
              name: 'Calendar',
              component: () => import('../views/CalendarView.vue'),
              meta: { group: true },
            },
          ],
        },
        {
          path: '',
          name: 'Profile',
          meta: { personal: true },
          children: [
            {
              path: 'tasks',
              name: 'PersonalTasks',
              component: TasksView,
              meta: { personal: true },
            },
            {
              path: 'calendar',
              name: 'PersonalCalendar',
              component: () => import('../views/CalendarView.vue'),
              meta: { personal: true },
            },
          ],
        },
      ],
    },
  ],
})

export default router
