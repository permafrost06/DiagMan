<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE, AUTH_TOKEN_KEY } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { ref } from "vue";
import Input from "@/components/form/Input.vue";

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
    <div class="auth-root">
        <form
            :action="API_BASE + `/auth/login`"
            @submit="handleForm"
            class="space-y-sm"
        >
            <h2>DiagMan</h2>
            <p class="sub-title font-h login-sub">Sign in to your account</p>
            <p v-if="error" class="alert error">{{ error }}</p>
            <div class="space-y-sm">
                <Input
                    placeholder="Email"
                    ic-box="20"
                    type="email"
                    name="email"
                />
                <Input placeholder="Password" type="password" name="password" />
            </div>
            <div class="mt-md font-h">
                <button type="submit" :disabled="isPosting">
                    {{ isPosting ? "Please wait..." : "Log In" }}
                </button>
            </div>
            <a href="#" class="link-area forgot-link">Forgot credentials?</a>
        </form>
    </div>
</template>
