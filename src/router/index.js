import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'CAD',
    component: () => import('@/views/CAD/CAD.vue')
  },
  {
    path: '/imgWithCovers',
    name: 'imgWithCovers',
    component: () => import('@/views/CAD/imgWithCovers.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
