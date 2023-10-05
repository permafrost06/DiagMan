<script setup lang="ts"></script>
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
                <li class="group-title">General</li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Appearance
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Report Templates
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Tests
                    </RouterLink>
                </li>
                <li>
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
                </li>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.account' }"
                        class="sidebar-link"
                    >
                        Account
                    </RouterLink>
                </li>
                <li>
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
                </li>
            </ul>
        </nav>
        <div class="setting-page-area">
            <RouterView></RouterView>
        </div>
    </div>
</template>
