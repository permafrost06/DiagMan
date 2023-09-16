<script setup lang="ts">
import { API_BASE, AUTH_TOKEN_KEY } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const user = ref();
const loggingOut = ref(false);

const logout = async () => {
    if (loggingOut.value) {
        return;
    }
    loggingOut.value = true;
    const res = await fetchApi(API_BASE + "/auth/logout", {
        method: "POST",
    });
    loggingOut.value = false;
    if (res.success) {
        user.value = null;
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
};

onMounted(async () => {
    const res = await fetchApi(API_BASE + "/auth");
    if (res.success) {
        user.value = res.rows?.[0];
    }
});
</script>
<template>
    This is home <br />
    <RouterLink :to="{ name: 'components' }">Components</RouterLink>
    <RouterLink :to="{ name: 'tests' }">Tests</RouterLink>
    <RouterLink :to="{ name: 'patients' }">Patients</RouterLink>
    <br />
    <hr />
    <div v-if="user">
        <p>Logged in as: {{ user.name }}</p>
        <br />
        <button @click="logout">
            {{ loggingOut ? "Loading..." : "Logout" }}
        </button>
        <br />
        <RouterLink :to="{ name: 'users' }">Users</RouterLink>
    </div>
    <div v-else>
        <RouterLink :to="{ name: 'login' }">Login</RouterLink>
        <RouterLink :to="{ name: 'register' }">Register</RouterLink>
    </div>
</template>
<style>
a,
p {
    display: block;
    padding: 0 10px;
}
</style>
