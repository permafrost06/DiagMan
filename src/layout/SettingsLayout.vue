<script setup lang="ts">
import Icon from "@/components/base/Icon.vue";
</script>
<template>
    <div class="settings-layout">
        <nav class="sidebar font-h">
            <RouterLink
                :to="{ name: 'settings' }"
                class="sidebar-top flex items-center"
            >
                Settings
            </RouterLink>
            <ul>
                <!-- <li class="group-title">General</li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Appearance
                    </RouterLink>
                </li> -->
                <li>
                    <RouterLink
                        :to="{ name: 'settings.report-templates' }"
                        class="sidebar-link"
                    >
                        Report Templates
                    </RouterLink>
                </li>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.tests' }"
                        class="sidebar-link"
                    >
                        Tests
                    </RouterLink>
                </li>
                <!-- <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        SMS
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Printing
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Charts
                    </RouterLink>
		</li> -->
                <li>
                    <RouterLink
                        :to="{ name: 'settings.account' }"
                        class="sidebar-link"
                    >
                        Account
                    </RouterLink>
                </li>
                <!-- <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Notifications
                    </RouterLink>
                </li>
            </ul>
            <ul>
                <li class="group-title">Administrative</li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Manage Users
                    </RouterLink>
                </li>

                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Advanced
                    </RouterLink>
                </li>
            </ul>
            <ul>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        About
                    </RouterLink>
		</li> -->
            </ul>
        </nav>
        <div class="setting-page-area">
            <RouterView></RouterView>
        </div>
        <RouterLink :to="{ name: 'home' }" class="home-url">
            <Icon size="40" view-box="36">
                <path
                    fill="currentColor"
                    d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                    class="clr-i-outline clr-i-outline-path-1"
                /><path fill="none" d="M0 0h36v36H0z" />
            </Icon>
        </RouterLink>
    </div>
</template>

<style lang="scss">
.settings-layout {
    display: flex;
    height: 100%;
    width: 100%;

    .sidebar {
        margin: 0;
        padding: 0;
        background: var(--clr-white);
        width: 330px;
        font-weight: 500;
        padding: 30px 20px;
    }

    .sidebar .sidebar-top {
        text-decoration: none;
        color: var(--clr-black);
        font-size: var(--fs-xl);
        padding: 0 10px;
        gap: 30px;
    }

    .sidebar ul {
        margin: 0;
        padding: 0;
        border-bottom: 1px solid var(--clr-black);
    }
    .sidebar li {
        list-style-type: none;
        border-bottom: 1px solid var(--clr-white);
    }

    .sidebar-link {
        display: block;
        text-decoration: none;
        color: var(--clr-black);
        padding: 5px 10px;
        font-size: var(--fs-md);
    }
    .sidebar .group-title {
        opacity: 0.9;
        padding: 0 10px;
        padding-top: 10px;
        font-weight: lighter;
    }
    .sidebar-link.router-link-exact-active {
        background: var(--clr-black);
        color: var(--clr-white);
    }

    .setting-page-area {
        padding: 30px;
        padding-right: 50px;
        flex-grow: 1;
        overflow-y: auto;
    }
}
</style>
