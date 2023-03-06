<script setup lang="ts">
import { ref } from "vue";
import TableComponent from "@/components/TableComponent.vue";

const tableCols = ref([
    {
        name: "no",
        label: "No",
    },
    {
        name: "name",
        label: "Name",
    },
    {
        name: "email",
        label: "Email",
    },
]);

const tableData = ref([
    { no: 1, name: "Some user", email: "someuser@gmail.com" },
    { no: 2, name: "Some user", email: "someuser@gmail.com" },
    { no: 3, name: "Some user", email: "someuser@gmail.com" },
    { no: 4, name: "Some user", email: "someuser@gmail.com" },
    { no: 5, name: "Some user", email: "someuser@gmail.com" },
]);
</script>

<template>
    <TableComponent :cols="tableCols" :data="tableData" style="width: 80vw" />
</template>
