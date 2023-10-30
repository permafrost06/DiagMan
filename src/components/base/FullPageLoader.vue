<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
const dots = ref<HTMLElement>();
let interval: any = 0;

onMounted(() => {
    interval = setInterval(() => {
        if (!dots.value) {
            return;
        }
        dots.value.innerText =
            dots.value.innerText.length > 2 ? "" : dots.value.innerText + ".";
    }, 250);
});

onUnmounted(() => {
    interval && clearInterval(interval);
});
</script>
<template>
    <div>
        <div class="spinner">Loading<span class="dots" ref="dots"></span></div>
    </div>
</template>
<style scoped>
.spinner {
    font-family: "Space Grotesk";
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 52px;
    transform: translate(-50%, -50%);
}

.dots {
    position: absolute;
}
</style>
