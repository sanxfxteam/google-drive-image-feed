import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import GoogleDriveImageFeed from '../components/GoogleDriveImageFeed.vue'
import InfiniteCanvas from '../components/InfiniteCanvas.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: GoogleDriveImageFeed
      },
      {
        path: 'canvas',
        name: 'Canvas',
        component: InfiniteCanvas
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router