<script setup lang="ts">
import { ref } from "vue";
import TableComponent from "@/components/TableComponent.vue";

const tableCols = ref([
    { name: "id", label: "ID" },
    { name: "no", label: "No" },
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
]);

const tableData = ref([
    { no: 1, name: "Some user", email: "someuser@gmail.com", id: "cyt-001" },
    { no: 2, name: "Some user", email: "someuser@gmail.com", id: "his-002" },
    { no: 3, name: "Some user", email: "someuser@gmail.com", id: "his-005" },
    { no: 4, name: "Some user", email: "someuser@gmail.com", id: "cyt-015" },
    { no: 5, name: "Some user", email: "someuser@gmail.com", id: "cyt-20" },
]);

const checked = ref<string[]>([]);

const checkIndex = ref("id");

const changeChecked = () => {
    const value = tableData.value[2].id;

    const index = checked.value.indexOf(value);
    if (index > -1) {
        checked.value.splice(index, 1);
    } else {
        checked.value.push(value);
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
        :checkbox-index="checkIndex"
    />
    <div>
        <div>check-index: {{ checkIndex }}</div>
        <div>checked: {{ checked }}</div>
    </div>
</template>
