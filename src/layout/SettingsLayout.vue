<script setup lang="ts"></script>
<template>
    <div class="settings-layout">
        <ul class="sidebar font-h">
            <li>
                <RouterLink
                    :to="{ name: 'settings' }"
                    class="sidebar-top flex items-center"
                >
                    <svg
                        width="14"
                        height="25"
                        viewBox="0 0 14 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M13 0.5L1 12.5L13 24.5" stroke="white" />
                    </svg>

                    Settings
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/settings/#" class="sidebar-link">
                    Appearance
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/settings/#" class="sidebar-link">
                    Tests
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/settings/#" class="sidebar-link">
                    Report Templates
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
                    Manage Users
                </RouterLink>
            </li>

            <li>
                <RouterLink to="/settings/#" class="sidebar-link">
                    Advanced
                </RouterLink>
            </li>
        </ul>
        <div class="setting-page-area">
            <RouterView></RouterView>
        </div>
    </div>
</template>
