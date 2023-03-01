<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated, ref } from "vue";

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

const tableRef = ref<HTMLTableElement>();

const props = withDefaults<TableXProps, {}>(defineProps<TableXProps>(), {
    width: "auto",
});

const cols = ref<TableCol[]>(props.cols);

onMounted(() => {
    window.addEventListener("mouseup", dragEnd);
    setupResize();
});

onUnmounted(() => {
    window.removeEventListener("mouseup", dragEnd);
});

onUpdated(() => {
    setupResize();
});

function setupResize() {
    if (!tableRef.value) {
        return;
    }

    const resizer = tableRef.value.querySelectorAll("th .resizer");
    resizer.forEach((el) => {
        el.addEventListener("mousedown", dragStart);
    });
}

let initialX = 0,
    initialWidth = 0,
    activeEl: HTMLTableCellElement;

const changeWidth = (event: MouseEvent) => {
    event.preventDefault();
    const distance = event.x - initialX;
    activeEl.style.width = initialWidth + distance + "px";
};

const dragStart = (event: Event) => {
    event.preventDefault();

    const target = event.target as HTMLDivElement;

    initialX = (event as MouseEvent).x;
    activeEl = target.parentElement as HTMLTableCellElement;
    target.style.height = tableRef.value?.getBoundingClientRect().height + "px";
    target.classList.add("active");

    initialWidth = activeEl.getBoundingClientRect().width;

    window.addEventListener("mousemove", changeWidth);
};

const dragEnd = () => {
    if (initialX > 0) {
        initialX = 0;
        activeEl.lastElementChild?.removeAttribute("style");
        activeEl.lastElementChild?.classList.remove("active");
        window.removeEventListener("mousemove", changeWidth);
    }
};
</script>

<template>
    <div class="table-wrapper">
        <table ref="tableRef" v-bind="$attrs">
            <thead>
                <tr>
                    <th
                        v-for="(cprops, idx) in cols"
                        :style="`width: ${cprops.width}`"
                        :class="cprops.thClass"
                        :data-id="idx"
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
th,
td {
    position: relative;
    padding: 0;
    padding-right: 5px;
    margin: 0;
    text-align: left;
    padding-left: 25px;
}

.resizer {
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    z-index: 1;
    border-right: 1px solid #a7a7a7;
}
.resizer.active {
    border-right: 2px solid rgb(64, 64, 255);
}

th:last-of-type .resizer {
    display: none;
}
</style>
