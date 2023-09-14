<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const user = ref();
onMounted(async () => {
    const res = await fetchApi(API_BASE + "/auth");
    console.log(res);
});
</script>
<template>
    This is home <br />
    <RouterLink :to="{ name: 'components' }">Components</RouterLink>
    <RouterLink :to="{ name: 'tests' }">Tests</RouterLink>
    <RouterLink :to="{ name: 'patients' }">Patients</RouterLink>
    <br />
    <hr />
    <p v-if="user">Logged in as: {{ user.name }}</p>
    <br />
    <RouterLink :to="{ name: 'login' }">Login</RouterLink>
    <RouterLink :to="{ name: 'register' }">Register</RouterLink>
</template>
<style>
a,
p {
    display: block;
    padding: 0 10px;
}
</style>
