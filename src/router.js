import {
    createWebHistory,
    createRouter
} from "vue-router";

import HelloWorld from "./components/HelloWorld.vue";
import TheWelcome from "./components/TheWelcome.vue";

const history = createWebHistory();
const routes = [
    {
    path: "/",
    component: HelloWorld
    },
    {
    path: "/costumers",
    component: TheWelcome
    },
];
const router = createRouter({
    history,
    routes
});
export default router;