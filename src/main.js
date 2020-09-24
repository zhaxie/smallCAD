import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/assets/css/xx-base.css';
import '@/assets/css/animate.css';
import '@/assets/css/iconfont.css';

import CAD from '@/store/CAD.js';
import { CommonBus, UniqueBus } from '@/assets/js/bus.js';

Vue.prototype.$bus = new CommonBus();         //bus工具
Vue.prototype.$bus_unique = new UniqueBus();  //单一bus（仅供订阅一次）

Vue.config.productionTip = false
Vue.prototype.$storeCAD = CAD;

Vue.prototype.$toast = ({ msg }) => {
  // alert(msg);

  console.error('$toast -msg 错误提示', msg);
}


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
}).$mount('#app')





// 人生实质上是求一场好的体验，
// 而不是求一个好的结果，
// 无论高低贵贱，
// 时间会终究会把你变成一抔黄土，
// 悄无声息地逝去，

// 那些能留下的，
// 是人们印象中的你，
// 或许还有些
// 你曾创造的、传承的价值

// 于自身而言，
// 活着是没有意义的，
// 因为你终将离去，什么也带不走
// 但对于身边人而言，你才是有意义的，
// 因为他们或许能享用你存在的价值

// 于是想到这里，
// 我才发现，所有的占有，
// 都是不切实的拥有
// 值得期盼的，是这一生，
// 能与值得人同道，体验生命的美好
