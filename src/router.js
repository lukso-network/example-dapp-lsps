import { createWebHistory, createRouter } from "vue-router";

import Login from "./pages/Login.vue";
import Dashboard from "./pages/Dashboard.vue";
import CreateToken from "./pages/CreateToken.vue";
// import CreateNFTCollection from "./pages/CreateNFTCollection.vue";

const history = createWebHistory("/");
const routes = [
  {
    path: "/",
    component: Dashboard,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/createToken",
    component: CreateToken,
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
