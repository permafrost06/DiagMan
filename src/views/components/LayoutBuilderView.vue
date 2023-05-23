<script lang="ts" setup>
import LayoutBuilder from "@/components/LayoutBuilder.vue";
import { ref, watch } from "vue";
const contents = ref<any>();

watch(contents, () => {
    console.log(contents.value);
});
</script>

<template>
    <div class="center">
        <LayoutBuilder v-model="contents" />
    </div>
</template>
<style scoped>
.center {
    max-width: 700px;
    margin: 50px auto;
}
</style>
