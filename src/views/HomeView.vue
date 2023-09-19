<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
<template>
    <ul>
        <li>
            <RouterLink :to="{ name: 'users' }">Users</RouterLink>
        </li>
        <li>
            <RouterLink :to="{ name: 'tests' }">Tests</RouterLink>
        </li>
        <li>
            <RouterLink :to="{ name: 'patients' }">Patients</RouterLink>
        </li>
    </ul>
</template>
