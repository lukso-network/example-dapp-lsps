import { createWebHashHistory, createRouter } from 'vue-router';

import Login from './pages/Login.vue';
import Dashboard from './pages/Dashboard.vue';

// LSP7
import CreateToken from './pages/CreateToken.vue';
import MintAsset from './pages/MintAsset.vue';

// LSP8
import CreateNFTCollection from './pages/CreateNFTCollection.vue';
import MintAssetInCollection from './pages/MintAssetInCollection.vue';

const history = createWebHashHistory(process.env.BASE_URL);
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
    path: '/asset/:address/mint',
    component: MintAsset,
  },
  {
    path: '/collection/:address/mint',
    component: MintAssetInCollection,
  },
  {
    path: '/createNFTCollection',
    component: CreateNFTCollection,
  },
];
const router = createRouter({
  history,
  routes,
});
export default router;
