<script setup lang="ts">
import CmpLink from "@/components/CmpLink.vue";
import { shallowRef, watch, type Component } from "vue";
import { useRoute } from "vue-router";
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
const components: string[] = ["TableComponent"];
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
<style scoped>
header {
    position: sticky;
    top: 0;
    box-shadow: 0 1px 3px gray;
    padding: 15px 15px;
    margin: 0;
    font-size: var(--fs-lg);
    z-index: 999;
    background: var(--clr-bg);
}
.cmps {
    display: grid;
    padding: 10px;
}
.cmps a {
    padding: 10px;
    border: 1px solid rgb(0, 0, 0);
}

.cmp {
    padding: 10px;
}
@media (min-width: 500px) {
    .cmps {
        grid-auto-columns: 50%;
        padding: 50px 100px;
    }
}
</style>
