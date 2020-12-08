/**
 * 静态路由表
 */

const routes = [
  {
    path: "/",
    component: () => import('@/views/home')
  }
];

export default routes;