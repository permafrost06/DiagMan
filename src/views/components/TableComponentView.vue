<script setup lang="ts">
import { computed, ref } from "vue";
import TableComponent, {
    type ShortenCol,
    type TableProps,
} from "@/components/TableComponent.vue";
import Pagination from "@/components/Pagination.vue";

const tableCols = ref([
    { name: "id", label: "ID" },
    { name: "no", label: "No" },
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
]);

const getUniqueData = (id: number) => ({
    no: id,
    name: "Some user " + id,
    email: `someuser${id}@gmail.com`,
    id: "cyt-00" + id,
});

const allData = (() => {
    const items: any[] = [];
    for (let i = 1; i < 101; i++) {
        items.push(getUniqueData(i));
    }
    return items;
})();

const pageSize = 10;
const page = ref<number>(1);

const tableData = computed(() => {
    return allData.slice(pageSize * (page.value - 1), pageSize * page.value);
});

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
</script>

<template>
    <div class="options">
        <div class="option">
            <h4 class="opt-title">Mobile View</h4>
            <div class="options">
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
        </div>
        <div class="option">
            <h4 class="opt-title">Row Actions</h4>
            <div class="options">
                <button @click="changeChecked">Toggle 3</button>
            </div>
        </div>

        <div class="option">
            <h4 class="opt-title">Config Actions</h4>
            <div class="options">
                <button @click="resizable = !resizable">
                    {{ resizable ? "Disable" : "Enable" }} resizability
                </button>
            </div>
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
    <Pagination
        v-model="page"
        :item-count="allData.length"
        :page-size="pageSize"
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
