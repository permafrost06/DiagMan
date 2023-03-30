<script setup lang="ts">
import { ref } from "vue";
import TableComponent, {
    type ShortenCol,
    type TableProps,
} from "@/components/TableComponent.vue";

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

const mobileView = ref<TableProps["mobileView"]>("transformed");

const shorten: ShortenCol[] = [
    {
        cols: [0],
    },
    {
        title: "Patient",
        cols: [2, 3],
    },
];

const resizable = ref<boolean>(true);

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

const actionOne = (data: any) => {
    console.log(data);
};

const logValue = () => {
    console.log([...checked.value]);
};
</script>

<template>
    <div class="flex justify-around">
        <div class="flex flex-center flex-wrap my-4">
            <button
                :class="{ active: mobileView === 'transformed' }"
                @click="mobileView = 'transformed'"
            >
                Transformed
            </button>
            <button
                :class="{ active: mobileView === 'moveable' }"
                @click="mobileView = 'moveable'"
            >
                Moveable
            </button>
            <button
                :class="{ active: mobileView === 'collapsed' }"
                @click="mobileView = 'collapsed'"
            >
                Collapsed
            </button>
            <button
                :class="{ active: mobileView === 'shorten' }"
                @click="mobileView = 'shorten'"
            >
                Shorten
            </button>
        </div>
        <div class="flex flex-center flex-wrap my-4">
            <button @click="changeChecked">Toggle 3</button>
            <button @click="logValue">Log Value</button>
        </div>

        <div class="flex flex-center flex-wrap my-4">
            <button @click="resizable = !resizable">
                {{ resizable ? "Disable" : "Enable" }} resizability
            </button>
        </div>
    </div>
    <TableComponent
        :cols="tableCols"
        :data="tableData"
        v-model:checked="checked"
        :checkbox-index="checkIndex"
        :mobile-view="mobileView"
        :actions="[
            {
                text: 'Finalize',
                onClick: actionOne,
            },
            {
                text: 'Delete',
                onClick: actionOne,
            },
        ]"
        :shorten="shorten"
        :resizable="resizable"
    />
    <div>
        <div>check-index: {{ checkIndex }}</div>
        <div>checked: {{ checked }}</div>
    </div>
</template>

<style scoped>
.active {
    color: blue;
}
</style>
