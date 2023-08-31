import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "",
            component: () => import("@/layout/FrontLayout.vue"),
            children: [
                {
                    path: "",
                    name: "home",
                    component: () => import("@/views/HomeView.vue"),
                },
            ],
        },
        {
            path: "/components/:name?",
            name: "components",
            component: () => import("@/views/ComponentsView.vue"),
        },
        {
            path: "/tests",
            name: "tests",
            component: () => import("@/views/tests/TestForm.vue"),
        },
        {
            path: "/records",
            name: "records",
            component: () => import("@/views/records/TestForm.vue"),
        },
    ],
});

export default router;
