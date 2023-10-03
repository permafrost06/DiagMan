<script setup lang="ts">
import appearanceIcon from "@/assets/icons/appearance.png";
import testsIcon from "@/assets/icons/tests.png";
</script>
<template>
    <div class="settings-page">
        <RouterLink
            class="back-link flex items-center font-h"
            :to="{ name: 'home' }"
        >
            <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M6.5 0.5L1 6L6.5 11.5" stroke="black" />
            </svg>
            Back to patients table
        </RouterLink>
        <h3 class="page-title">Settings</h3>
        <div class="setting-links">
            <RouterLink to="#" class="setting-link font-h">
                <img :src="appearanceIcon" />
                <p>Appearance</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>Tests</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>Report Templates</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>SMS</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>Account</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>Manage Users</p>
            </RouterLink>
            <RouterLink to="#" class="setting-link font-h">
                <img :src="testsIcon" />
                <p>Advanced</p>
            </RouterLink>
        </div>
    </div>
</template>
