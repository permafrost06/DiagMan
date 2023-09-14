<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE, AUTH_TOKEN_KEY } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { ref } from "vue";

const isPosting = ref<boolean>(false);
const error = ref<string | null>(null);

const handleForm = async (evt: any) => {
    evt.preventDefault();
    if (isPosting.value) {
        return;
    }
    isPosting.value = true;
    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });
    isPosting.value = false;
    if (!res.success) {
        error.value = res.message;
    } else {
        localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
        location.replace("/");
    }
};
</script>
<template>
    <form :action="API_BASE + `/auth/login`" @submit="handleForm">
        <h3>Login</h3>
        <p v-if="error" class="alert error">{{ error }}</p>
        <div>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" />
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" name="password" id="password" />
        </div>
        <button type="submit" :disabled="isPosting">
            {{ isPosting ? "Please wait..." : "Login" }}
        </button>
    </form>
</template>
<style>
form {
    padding: 10px;
    max-width: 500px;
    margin: auto;
}
</style>
