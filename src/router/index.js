import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import User from '../views/User.vue';
import Main from '../views/Main.vue';
import Mall from '../views/Mall.vue';
import Page1 from '../views/OtherPage1.vue';
import Page2 from '../views/OtherPage2.vue';
import Login from '@/views/login';
import Register from '@/views/Register';
import RoleManagement from '@/views/RoleManagement';
import classNoticeManagement from '@/views/classNoticeManagement';
import systemNotice from '@/views/systemNotice';
import classManagement from '@/views/classManagement';
import classNotice from '@/views/classNotice';
import classRequest from '@/views/classRequest';
import axios from 'axios';

Vue.use(VueRouter);

// 添加一个辅助函数，用于检查用户是否已登录
async function checkIfUserIsLoggedIn() {
  try {
    const response2 = await axios.post('http://localhost:8080/login/getInfo', {},{
      withCredentials: true,
    });

    const result = response2.data.code;

    if (result=== '20011') {
      return false;
    } else {
      // 登录有效，可以进行其他操作
      return true;
    }
  } catch (error) {
    console.error('Error checking user login status:', error);
    return false;
  }
}

// 1. 定义 (路由) 组件, 或者从import中引入组件
// 2. 每个路由应该映射一个组件
const routes = [
  //主路由
  {
    path: '/',
    component: Main,
    redirect: '/home', // ‘/’重定向到‘/home’
    children: [
      // 子路由
      { path: 'home', component: Home },
      { path: 'user', component: User },
      { path: 'message', component: Mall },
      { path: 'role', component: RoleManagement },
      { path: 'other/page1', component: Page1 },
      { path: 'other/page2', component: Page2 },
      { path: 'classNoticeManagement', component: classNoticeManagement },
      { path: 'systemNotice', component: systemNotice },
      { path: 'classManagement', component: classManagement },
      { path: 'classNotice', component: classNotice },
      { path: 'classRequest', component: classRequest },
    ],
  },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new VueRouter({
  routes, // (缩写) 相当于 routes: routes
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  console.log('Navigating from:', from.path);
  console.log('Navigating to:', to.path);

  // 检查用户是否已登录
  const isAuthenticated = await checkIfUserIsLoggedIn();
  console.log('Is authenticated:', isAuthenticated);

  // 在其他逻辑之前加入一些日志
  // ...

  // 修复逻辑，确保不会无限制地触发重定向
  if (!isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    console.log('Redirecting to /login');
    next('/login');
  } else {
    console.log('Continue with navigation');
    next();
  }
});



// 4. 在 main.js 中创建和挂载 router 实例
export default router;
