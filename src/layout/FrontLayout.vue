<script setup lang="ts">
import { useUser } from "@/stores/user";
import { onMounted, ref } from "vue";
import Login from "@/views/auth/Login.vue";
import Pin from "@/views/auth/Pin.vue";
import FullPageLoader from "@/components/base/FullPageLoader.vue";
import { RouterView } from "vue-router";
import { TMP_PIN_BYPASS_KEY } from "@/helpers/config";

const loading = ref(true);
const user = useUser();
const byPassOnce = localStorage.getItem(TMP_PIN_BYPASS_KEY);
if (byPassOnce) {
    localStorage.removeItem(TMP_PIN_BYPASS_KEY);
}

onMounted(async () => {
    await user.sync();
    loading.value = false;
});
</script>
<template>
    <FullPageLoader v-if="loading" />
    <Login v-else-if="!user.isLogged" />
    <Pin v-else-if="!user.verified && !byPassOnce" />
    <RouterView v-else></RouterView>
</template>
