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
                {
                    path: "/users",
                    name: "users",
                    component: () => import("@/views/users/Index.vue"),
                },
                {
                    path: "/tests",
                    name: "tests",
                    component: () => import("@/views/tests/TestForm.vue"),
                },
                {
                    path: "/patients/add",
                    name: "patients.add",
                    component: () => import("@/views/patients/PatientForm.vue"),
                },
                {
                    path: "/reports",
                    name: "reports",
                    component: () => import("@/views/patients/Reports.vue"),
                },
                {
                    path: "/settings",
                    component: () => import("@/layout/SettingsLayout.vue"),
                    children: [
                        {
                            path: "",
                            name: "settings",
                            redirect: {
                                name: "settings.account",
                            },
                        },
                        {
                            path: "account",
                            name: "settings.account",
                            component: () =>
                                import("@/views/settings/AccountSetting.vue"),
                        },
                        {
                            path: "tests",
                            name: "settings.tests",
                            component: () =>
                                import("@/views/settings/TestsSetting.vue"),
                        },
                    ],
                },
            ],
        },
        {
            path: "/auth",
            children: [
                {
                    path: "login",
                    name: "login",
                    component: () => import("@/views/auth/Login.vue"),
                },
                {
                    path: "register",
                    name: "register",
                    component: () => import("@/views/auth/Register.vue"),
                },
            ],
        },
    ],
});

export default router;
