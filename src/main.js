import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/assets/css/xx-base.css';
import '@/assets/css/animate.css';
import '@/assets/css/iconfont.css';

import CAD from '@/store/CAD.js';

Vue.config.productionTip = false


Vue.prototype.$storeCAD = CAD;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
