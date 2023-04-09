<script lang="ts" setup>
import Pagination from "@/components/Pagination.vue";
import { ref } from "vue";
const page = ref<number>(1);
</script>

<template>
    <Pagination :pages="10" :item-count="100" v-model="page" />
</template>
