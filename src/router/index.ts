import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/publish',
      name: 'Publish',
      component: () => import('../views/Publish.vue')
    }
  ]
})

export default router
