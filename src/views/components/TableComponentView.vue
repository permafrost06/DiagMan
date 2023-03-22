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

const checked = ref<number[]>([2, 3]);

const changeChecked = () => {
    const index = checked.value.indexOf(3);
    if (index > -1) {
        checked.value.splice(index, 1);
    } else {
        checked.value.push(3);
    }
};
const logValue = () => {
    console.log([...checked.value]);
};
</script>

<template>
    <button @click="changeChecked">Toggle 3</button>
    <button @click="logValue">Log Value</button>
    <TableComponent
        :cols="tableCols"
        :data="tableData"
        v-model:checked="checked"
        checkbox-index="no"
    />
</template>
