import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Publish from '../views/Publish.vue'
import UserProfile from '../views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/publish',
      name: 'publish',
      component: Publish
    },
    {
      path: '/user/:id',
      name: 'userProfile',
      component: UserProfile
    }
  ]
})

export default router
