import {
    createWebHistory,
    createRouter
} from "vue-router";

import Login from "./pages/Login.vue";
import Dashboard from "./pages/Dashboard.vue";

const history = createWebHistory();
const routes = [
    {
        path: "/",
        component: Dashboard
    },
    {
        path: "/login",
        component: Login
    },
];
const router = createRouter({
    history,
    routes
});
export default router;