import Vue from 'vue'
import Router from 'vue-router'
import Convert from './views/Convert.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/convert'
    },
    {
      path: '/convert',
      name: 'convert',
      component: Convert
    },
    {
      path: '/district',
      name: 'district',
      component: () => import('./views/District.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
              import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
