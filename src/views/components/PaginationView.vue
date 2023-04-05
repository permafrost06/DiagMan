<script lang="ts" setup>
import Pagination from "@/components/Pagination.vue";
const items: number[] = Array.from({ length: 10 }, (_, i) => i);
</script>

<template>
    <Pagination :items="[]" :current="10" :all-items="items" />
</template>
