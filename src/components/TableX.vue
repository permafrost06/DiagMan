<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

export type TableCol = {
    label: string;
    name: string;
    className?: string;
    thClass?: string;
    width?: string;
};

export interface TableXProps {
    cols: TableCol[];
    data: any[];
}

let initialX = 0,
    initialWidth = 0,
    activeEl: HTMLTableCellElement;

const changeWidth = (evt: MouseEvent) => {
    const distance = evt.x - initialX;
    activeEl.style.width = initialWidth + distance + "px";
};

const dragStart = (evt: Event) => {
    initialX = (evt as MouseEvent).x;
    activeEl = (evt.target as HTMLTableCellElement)
        .parentElement as HTMLTableCellElement;

    initialWidth = activeEl.getBoundingClientRect().width;

    window.addEventListener("mousemove", changeWidth);
};

const dragEnd = () => {
    if (initialX > 0) {
        initialX = 0;
        window.removeEventListener("mousemove", changeWidth);
    }
};

const tableRef = ref<HTMLTableElement>();

withDefaults<TableXProps, {}>(defineProps<TableXProps>(), {
    width: "auto",
});

onMounted(() => {
    window.addEventListener("mouseup", dragEnd);

    if (!tableRef.value) {
        return;
    }

    const resizers = tableRef.value.querySelectorAll("th .resizer");
    resizers.forEach((el) => {
        el.addEventListener("mousedown", dragStart);
    });
});

onUnmounted(() => {
    window.removeEventListener("mouseup", dragEnd);
});
</script>

<template>
    <div class="table-wrapper">
        <table cellspacing="0" ref="tableRef">
            <thead>
                <tr>
                    <th
                        v-for="cprops in cols"
                        :style="`width: ${cprops.width}`"
                        :class="cprops.thClass"
                    >
                        {{ cprops.label }}
                        <div class="resizer"></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in data">
                    <td v-for="cprops in cols" :class="cprops.className">
                        {{ row[cprops.name] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-wrapper {
    width: max-content;
    position: relative;
}

th,
td {
    position: relative;
    padding: 0;
    padding-right: 5px;
    margin: 0;
}

.resizer {
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    z-index: 1;
    background: red;
}
</style>
