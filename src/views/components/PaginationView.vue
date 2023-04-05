<script lang="ts" setup>
import Pagination from "@/components/Pagination.vue";
const items: number[] = [];

for (let i = 0; i < 10; i++) {
    items.push(i);
}
</script>
<template>
    <Pagination :items="[]" :current="10" :all-items="items" />
</template>
