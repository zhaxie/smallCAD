import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import '@/assets/css/xx-base.css';
import '@/assets/css/animate.css';
import '@/assets/css/iconfont.css';

import CAD from '@/store/CAD.js';
import { CommonBus, UniqueBus } from '@/assets/js/bus.js';

Vue.prototype.$bus = new CommonBus();         //bus工具
Vue.prototype.$bus_unique = new UniqueBus();  //单一bus（仅供订阅一次）

Vue.config.productionTip = false;
Vue.prototype.$storeCAD = CAD;

Vue.prototype.$toast = ({ msg }) => {
  console.error('$toast -msg 错误提示', msg);
}

Vue.use(ElementUI);

//错误捕捉和提示
Vue.prototype.$catchError = (error) => {
  let newError = new Error();
  let errorFunctionName = newError.stack.split("\n")[2].trim().split(" ")[1];

  console.error('错误函数名：', errorFunctionName);
  console.error('内容：', error);
  console.info('更多信息', newError);

  Vue.prototype.$toast({
    color: 'error',
    msg: error,
  });
};

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');