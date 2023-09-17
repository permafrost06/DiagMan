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
            <h3>Login</h3>
            <p v-if="error" class="alert error">{{ error }}</p>
            <div class="space-y-md">
                <Input label="Email" ic-box="20" type="email" name="email">
                    <path
                        fill="currentColor"
                        d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    ></path>
                    <path
                        fill="currentColor"
                        d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    ></path>
                </Input>
                <Input type="password" name="password" label="Password">
                    <path
                        fill="currentColor"
                        d="M22 19h-6v-4h-2.68c-1.14 2.42-3.6 4-6.32 4c-3.86 0-7-3.14-7-7s3.14-7 7-7c2.72 0 5.17 1.58 6.32 4H24v6h-2v4zm-4-2h2v-4h2v-2H11.94l-.23-.67C11.01 8.34 9.11 7 7 7c-2.76 0-5 2.24-5 5s2.24 5 5 5c2.11 0 4.01-1.34 4.71-3.33l.23-.67H18v4zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3s3 1.35 3 3s-1.35 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1z"
                    />
                </Input>
                <div class="flex items-center remember-area">
                    <input id="remember" type="checkbox" name="remember" />
                    <label for="remember" class="label mb-0">Remember Me</label>
                </div>
            </div>
            <div class="mt-md">
                <button type="submit" :disabled="isPosting" class="ml-auto">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="17"
                        width="17"
                        viewBox="0 0 8 8"
                    >
                        <path
                            fill="currentColor"
                            d="M3 0v1h4v5H3v1h5V0H3zm1 2v1H0v1h4v1l2-1.5L4 2z"
                        />
                    </svg>
                    {{ isPosting ? "Please wait..." : "Login" }}
                </button>
            </div>
        </form>
    </div>
</template>
<style>
.remember-area {
    border-bottom: 1px solid #dddddd;
    padding-bottom: 10px;
}
.remember-area label {
    margin-left: 5px;
}
</style>
