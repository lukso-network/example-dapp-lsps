import { createWebHashHistory, createRouter } from 'vue-router';

import Login from './pages/Login.vue';
import Dashboard from './pages/Dashboard.vue';
import CreateToken from './pages/CreateToken.vue';
import AssetPage from './pages/AssetPage.vue';
// import CreateNFTCollection from "./pages/CreateNFTCollection.vue";

const history = createWebHashHistory('/');
const routes = [
  {
    path: '/',
    component: Dashboard,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/createToken',
    component: CreateToken,
  },
  {
    path: '/asset/:address',
    component: AssetPage,
  },
  // {
  //     path: "/createNFTCollection",
  //     component: CreateNFTCollection
  // },
];
const router = createRouter({
  history,
  routes,
});
export default router;
