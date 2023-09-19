<script setup lang="ts">
import { useUser } from "@/stores/user";
import { onMounted, ref } from "vue";
import Login from "./auth/Login.vue";
import Pin from "./auth/Pin.vue";
import FullPageLoader from "@/components/base/FullPageLoader.vue";

const loading = ref(true);

const user = useUser();

onMounted(async () => {
    await user.sync();
    loading.value = false;
});
</script>
<template>
    <FullPageLoader v-if="loading" />
    <Login v-else-if="!user.isLogged" />
    <Pin v-else-if="!user.verified" />
    <div v-else>Logged in</div>
</template>
