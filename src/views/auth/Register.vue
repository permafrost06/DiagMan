<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
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
    console.log(res);
    if (!res.success) {
        error.value = res.message;
    } else {
        location.replace("/");
    }
};
</script>
<template>
    <form :action="API_BASE + `/auth/register`" @submit="handleForm">
        <h3>Register</h3>
        <p v-if="error" class="alert error">{{ error }}</p>
        <div>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" />
        </div>
        <div>
            <label for="name">Name</label>
            <input type="text" name="name" id="name" />
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" name="password" id="password" />
        </div>
        <div>
            <label for="confirm_password">confirm_Password</label>
            <input
                type="password"
                name="confirm_password"
                id="confirm_password"
            />
        </div>
        <button type="submit" :disabled="isPosting">
            {{ isPosting ? "Please wait..." : "Register" }}
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
