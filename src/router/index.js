import { createRouter, createWebHistory } from 'vue-router'
import GoogleDriveImageFeed from '../components/GoogleDriveImageFeed.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GoogleDriveImageFeed
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router