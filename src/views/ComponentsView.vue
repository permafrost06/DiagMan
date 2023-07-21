<script setup lang="ts">
import CmpLink from "@/components/CmpLink.vue";
import { shallowRef, watch, type Component } from "vue";
import { useRoute } from "vue-router";

import "@/assets/test.css";

const route = useRoute();
const cmp = shallowRef<Component>();

checkCmp();
watch(route, checkCmp);
async function checkCmp() {
    if (!route.params?.name) {
        cmp.value = undefined;
        return;
    }
    cmp.value = (
        await import(
            /* @vite-ignore */ `@/views/components/${route.params?.name}View.vue`
        )
    ).default;
}
const components: string[] = ["TableComponent", "Pagination", "Notification"];
</script>
<template>
    <header>Components</header>
    <main v-if="!cmp" class="cmps">
        <CmpLink
            v-for="cmp of components"
            :name="cmp"
            :key="`cmp_link_${cmp}`"
            >{{ cmp }}</CmpLink
        >
    </main>
    <main class="cmp" v-else>
        <component :is="cmp" />
    </main>
</template>
