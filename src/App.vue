<script setup lang="ts">
import { RouterView } from "vue-router";
import notify from "./components/notification";
import { onMounted } from "vue";
onMounted(() => {
    let c = 0;
    document.addEventListener("click", (evt) => {
        c++;
        [
            "left", //"right"
        ].forEach((x) => {
            [
                "top", //"bottom"
            ].forEach((y) => {
                const side = `${y}-${x}`;
                const duration = evt.shiftKey ? 0 : 2000;

                notify({
                    message: `Test ${side}: ${c}`,
                    position: side as any,
                    duration,
                });
            });
        });
    });
});
</script>

<template>
    <RouterView />
</template>
