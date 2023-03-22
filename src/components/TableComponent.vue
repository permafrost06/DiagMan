<script setup lang="ts">
import {
    onMounted,
    onUnmounted,
    onUpdated,
    ref,
    watch,
    type TableHTMLAttributes,
} from "vue";

export type TableCol = {
    label: string;
    name: string;
    className?: string;
    thClass?: string;
    width?: string;
};

export interface TableProps extends TableHTMLAttributes {
    cols: TableCol[];
    data: any[];
    checked?: any[];
    checkboxIndex?: string;
}

const emit = defineEmits<{
    (e: "update:checked", values: any[]): void;
}>();

const props = defineProps<TableProps>();

const checkedValues = ref<any[]>(props.checked || []);
const tableRef = ref<HTMLTableElement>();
const checkBoxRef = ref<HTMLInputElement>();
const checkBoxState = ref<boolean | "indeterminate">(false);

const data = ref<any[]>(props.data);

let changedFromHere = false;
watch(props, () => {
    if (!changedFromHere) {
        checkedFromParent();
    } else {
        changedFromHere = false;
    }
});
checkedFromParent();

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

    const totalPadding = window
        .getComputedStyle(activeEl)
        .paddingInline.split(" ")
        .reduce((acc, pad) => acc + Number(pad.split("px")[0]), 0);

    initialWidth = activeEl.clientWidth - totalPadding;

    tableRef.value?.classList.add("resize-active");
    window.addEventListener("mousemove", changeWidth);
};

const dragEnd = () => {
    if (initialX > 0) {
        initialX = 0;
        activeEl.lastElementChild?.removeAttribute("style");
        activeEl.lastElementChild?.classList.remove("active");
        tableRef.value?.classList.remove("resize-active");
        window.removeEventListener("mousemove", changeWidth);
    }
};

const onRowCheckBoxChange = (evt: Event, idx: number) => {
    //@ts-ignore
    const value = evt.target.checked;
    let allChecked = true;
    let allNotCheked = true;

    const checked: any[] = [];

    data.value = data.value.map((item, index) => {
        if (index == idx) {
            item.__checked = value;
        }
        if (!item.__checked) {
            allChecked = false;
        } else {
            allNotCheked = false;
            if (props.checkboxIndex) {
                checked.push(item[props.checkboxIndex]);
            }
        }

        return item;
    });

    if (allChecked) {
        checkBoxState.value = true;
    } else if (allNotCheked) {
        checkBoxState.value = false;
    } else {
        checkBoxState.value = "indeterminate";
    }
    changedFromHere = true;
    checkedValues.value = checked;
    emit("update:checked", checked);
};

const bulkCheckChange = (evt: Event) => {
    //@ts-ignore
    const value = evt.target.checked;
    const checked: any[] = [];
    checkBoxState.value = value;
    data.value = data.value.map((item) => {
        item.__checked = value;
        if (props.checkboxIndex) {
            checked.push(item[props.checkboxIndex]);
        }
        return item;
    });

    changedFromHere = true;
    checkedValues.value = checked;
    emit("update:checked", checked);
};

function checkedFromParent() {
    if (props.checkboxIndex && props.checked) {
        let allChecked = true;
        let allNotCheked = true;

        data.value.forEach((item) => {
            item.__checked =
                //@ts-ignore
                props.checked?.indexOf(item[props.checkboxIndex]) > -1;

            if (!item.__checked) {
                allChecked = false;
            } else {
                allNotCheked = false;
            }
        });

        if (allChecked) {
            checkBoxState.value = true;
        } else if (allNotCheked) {
            checkBoxState.value = false;
        } else {
            checkBoxState.value = "indeterminate";
        }
    }
}
</script>

<template>
    <div class="table-wrapper">
        <table ref="tableRef" v-bind="$attrs" class="tablex">
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            :checked="checkBoxState === true"
                            :indeterminate="checkBoxState === 'indeterminate'"
                            @click="bulkCheckChange"
                            ref="checkBoxRef"
                        />
                    </th>
                    <th
                        v-for="(cprops, idx) in cols"
                        :style="`width: ${cprops.width}`"
                        :class="cprops.thClass"
                        :key="idx"
                    >
                        {{ cprops.label }}
                        <div class="resizer"></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, row_idx) in data" :key="row_idx">
                    <td>
                        <input
                            type="checkbox"
                            :checked="row.__checked"
                            @change="(evt) => onRowCheckBoxChange(evt, row_idx)"
                        />
                    </td>
                    <td
                        v-for="(cprops, col_idx) in cols"
                        :class="cprops.className"
                        :key="col_idx"
                    >
                        {{ row[cprops.name] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.resize-active {
    cursor: col-resize;
}
table {
    border-collapse: separate;
    border-spacing: 0 4px;
}

th,
td {
    position: relative;
    padding: 18.5px 5px;
    margin: 0;
    text-align: center;
    background: var(--tblx-bg);
    color: var(--tblx-text);
}

th:first-child,
td:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}
th:last-child,
td:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

th::after {
    content: "";
    height: var(--fs-md);
    width: 1px;
    background: var(--tblx-border);
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
}
th:last-child::after {
    display: none;
}

th {
    font-size: var(--fs-md);
    padding: 21px 5px;
    font-weight: 600;
}

.resizer {
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    z-index: 1;
}
.resizer.active {
    border-right: 2px solid rgb(64, 64, 255);
}

th:last-of-type .resizer {
    display: none;
}
</style>
