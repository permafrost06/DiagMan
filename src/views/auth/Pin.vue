<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE, TMP_USER_KEY } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";
import Input from "@/components/form/Input.vue";
import { useUser } from "@/stores/user";

const user = useUser();
const isPosting = ref<boolean>(false);
const error = ref<string | null>(null);

onMounted(() => {
    const savedUser = localStorage.getItem(TMP_USER_KEY);
    if (savedUser) {
        user.pin = 1;
        localStorage.removeItem(TMP_USER_KEY);
    }

    (document.querySelector('input[name="pin"]') as HTMLInputElement)?.focus();
});

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
        user.pin = res.data.pin;
    }
};

const toPassword = () => {
    user.id = 0;
};
</script>
<template>
    <div class="auth-root">
        <form
            :action="API_BASE + `/auth/verify`"
            @submit="handleForm"
            class="space-y-sm"
        >
            <h1 class="fs-3xl">DiagMan</h1>
            <p class="sub-title pin-sub font-h">Enter your PIN to unlock</p>
            <p v-if="error" class="alert error">{{ error }}</p>
            <p class="user-name text-center font-h">{{ user.name }}</p>
            <div class="text-center">
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M15 1.25C10.8452 1.25 7.5 4.59524 7.5 8.75V10C6.13367 10 5 11.1337 5 12.5V25C5 26.3663 6.13367 27.5 7.5 27.5H22.5C23.8663 27.5 25 26.3663 25 25V12.5C25 11.1337 23.8663 10 22.5 10V8.75C22.5 4.59524 19.1548 1.25 15 1.25ZM15 3.75C17.8452 3.75 20 5.90476 20 8.75V10H10V8.75C10 5.90476 12.1548 3.75 15 3.75ZM7.5 12.5H22.5V25H7.5V12.5ZM15 16.25C13.625 16.25 12.5 17.375 12.5 18.75C12.5 20.125 13.625 21.25 15 21.25C16.375 21.25 17.5 20.125 17.5 18.75C17.5 17.375 16.375 16.25 15 16.25Z"
                        fill="#1A1A1A"
                    />
                </svg>
            </div>

            <div class="space-y-sm">
                <Input placeholder="PIN" type="password" name="pin" />
            </div>
            <div class="mt-md font-h">
                <button type="submit" :disabled="isPosting">
                    {{ isPosting ? "Please wait..." : "Log In" }}
                </button>
                <button
                    type="button"
                    class="pin-to-password"
                    @click="toPassword"
                >
                    Login using password instead!
                </button>
            </div>
            <div class="link-area">
                <RouterLink :to="{ name: 'login' }" class="login-link">
                    Log in to another account
                </RouterLink>
                <!-- <a href="#" class="forgot-link">Forgot pin?</a> -->
            </div>
        </form>
    </div>
</template>
