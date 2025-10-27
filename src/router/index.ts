import { createRouter, createWebHistory } from "vue-router";
import RacesView from "../views/RacesView.vue";
import RaceDetailView from "../views/RaceDetailView.vue";
import GroupsView from "../views/GroupsView.vue";
import GroupView from "../views/GroupView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import { authService } from "../services/auth";

const routes = [
    {
        path: "/",
        redirect: "/races",
    },
    {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { requiresGuest: true }
    },
    {
        path: "/register",
        name: "register",
        component: RegisterView,
        meta: { requiresGuest: true }
    },
    {
        path: "/races",
        name: "races",
        component: RacesView,
        meta: { requiresAuth: true }
    },
    {
        path: "/race/:id",
        name: "race",
        component: RaceDetailView,
        meta: { requiresAuth: true }
    },
    {
        path: "/groups",
        name: "groups",
        component: GroupsView,
        meta: { requiresAuth: true }
    },
    {
        path: "/group/:id",
        name: "group",
        component: GroupView,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const isAuthenticated = authService.isAuthenticated();

    // Check if route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    }
    // Check if route requires guest (login/register pages)
    else if (to.meta.requiresGuest && isAuthenticated) {
        next('/races');
    }
    else {
        next();
    }
});

export default router;
