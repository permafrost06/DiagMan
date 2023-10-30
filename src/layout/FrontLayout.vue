<script setup lang="ts">
import { useUser } from "@/stores/user";
import { onMounted, ref } from "vue";
import Login from "@/views/auth/Login.vue";
import Pin from "@/views/auth/Pin.vue";
import FullPageLoader from "@/components/base/FullPageLoader.vue";
import { RouterView } from "vue-router";

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
    <RouterView v-else></RouterView>
</template>
