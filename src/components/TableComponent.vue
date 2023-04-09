<script setup lang="ts">
import {
    computed,
    onMounted,
    onUnmounted,
    onUpdated,
    ref,
    type TableHTMLAttributes,
} from "vue";

export interface TableCol {
    label: string;
    name: string;
    className?: string;
    thClass?: string;
    width?: string;
    break?: boolean;
}

export interface RowAction {
    text: string;
    onClick: (row: any, evt: Event) => void;
}

export interface ShortenCol {
    cols: number[];
    thClass?: string;
    className?: string;
    title?: string;
}

export interface TableProps extends TableHTMLAttributes {
    cols: TableCol[];
    data: any[];
    mobileView?: "moveable" | "collapsed" | "transformed" | "shorten";
    breakpoint?: number;
    actions?: RowAction[];

    shorten?: Array<ShortenCol>;

    resizable?: boolean;

    checked?: string[];
    checkboxIndex?: string;
}

const emit = defineEmits<{
    (e: "update:checked", values: any[]): void;
}>();

const props = withDefaults(defineProps<TableProps>(), {
    mobileView: "moveable",
    breakpoint: 600,
});

const tableRef = ref<HTMLTableElement>();
const windowSize = ref<number>(0);
const checkedValues = ref<string[]>(props.checked || []);

onMounted(() => {
    window.addEventListener("mouseup", dragEnd);
    windowSize.value = window.innerWidth;
    setupResize();

    window.addEventListener("resize", windowResizeEvt);
});

onUnmounted(() => {
    window.removeEventListener("mouseup", dragEnd);
    window.removeEventListener("resize", windowResizeEvt);
});

onUpdated(() => {
    setupResize();
});

function setupResize() {
    if (!tableRef.value) {
        return;
    }

    const thEls = tableRef.value.querySelectorAll("th");
    thEls.forEach((th) => {
        if (th.style.minWidth) {
            return;
        }
        const w = th.clientWidth + "px";
        th.style.minWidth = w;
    });

    const resizer = tableRef.value.querySelectorAll("th .resizer");
    resizer.forEach((el) => {
        el.addEventListener("mousedown", dragStart);
    });
}

function windowResizeEvt() {
    windowSize.value = window.innerWidth;
}

let initialX = 0,
    initialWidth = 0,
    initialTableWidth = 0,
    activeEl: HTMLTableCellElement;

const changeWidth = (event: MouseEvent) => {
    event.preventDefault();

    if (!tableRef.value) {
        return;
    }

    const distance = event.x - initialX;
    const width = initialWidth + distance + "px";
    activeEl.style.minWidth = width;
    activeEl.style.maxWidth = width;

    const tableWidth = initialTableWidth + distance + "px";
    tableRef.value.style.minWidth = tableWidth;
    tableRef.value.style.maxWidth = tableWidth;
};

const dragStart = (event: Event) => {
    event.preventDefault();

    const target = event.target as HTMLDivElement;

    initialX = (event as MouseEvent).x;
    activeEl = target.parentElement as HTMLTableCellElement;
    target.style.height = tableRef.value?.getBoundingClientRect().height + "px";
    target.classList.add("active");

    const computedStyle = window.getComputedStyle(activeEl);
    const totalPadding =
        parseInt(computedStyle.paddingLeft) +
        parseInt(computedStyle.paddingRight);

    initialWidth = activeEl.clientWidth - totalPadding;
    initialTableWidth = tableRef.value?.clientWidth || 0;

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

const bulkCheckboxState = computed(() => {
    if (!checkedValues.value.length) return false;
    if (checkedValues.value.length !== props.data.length)
        return "indeterminate";

    return true;
});

const onBulkCheckboxChange = (evt: Event) => {
    // @ts-ignore
    const checked = evt.target?.checked;

    if (checked) {
        checkedValues.value = props.data.map((row, idx) =>
            props.checkboxIndex ? row[props.checkboxIndex] : idx
        );
    }

    if (!checked) {
        checkedValues.value = [];
    }

    emit("update:checked", checkedValues.value);
};

const emitCheckboxUpdate = () => {
    emit("update:checked", checkedValues.value);
};
</script>

<template>
    <div
        :class="{
            'table-wrapper': true,
            transformed: mobileView === 'transformed',
            moveable: mobileView === 'moveable',
            collapsed: mobileView === 'collapsed',
            shorten: mobileView === 'shorten',
        }"
    >
        <table
            v-if="mobileView !== 'transformed' || windowSize > breakpoint"
            ref="tableRef"
            v-bind="$attrs"
        >
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            :checked="bulkCheckboxState === true"
                            :indeterminate="
                                bulkCheckboxState === 'indeterminate'
                            "
                            @change="onBulkCheckboxChange"
                        />
                    </th>
                    <template
                        v-if="
                            mobileView !== 'shorten' ||
                            windowSize > breakpoint ||
                            !shorten
                        "
                    >
                        <th
                            v-for="cprops in cols"
                            :style="`width: ${cprops.width}`"
                            :class="cprops.thClass"
                            :key="cprops.name"
                        >
                            {{ cprops.label }}
                            <div v-if="resizable" class="resizer"></div>
                        </th>
                    </template>
                    <template v-else>
                        <th
                            v-for="(group, gidx) in shorten"
                            :class="group.thClass"
                            :key="gidx"
                        >
                            {{
                                group.title ||
                                group.cols
                                    .map((cidx) => cols[cidx].label)
                                    .join(" / ")
                            }}
                        </th>
                    </template>
                    <th v-if="actions">Actions</th>
                </tr>
            </thead>
            <tbody
                v-if="
                    mobileView !== 'shorten' ||
                    windowSize > breakpoint ||
                    !shorten
                "
            >
                <tr v-for="(row, row_idx) in data" :key="row_idx">
                    <td>
                        <input
                            type="checkbox"
                            v-model="checkedValues"
                            :value="
                                checkboxIndex ? row[checkboxIndex] : row_idx
                            "
                            @change="emitCheckboxUpdate"
                        />
                    </td>
                    <td
                        v-for="cprops in cols"
                        :class="cprops.className"
                        :key="cprops.name"
                    >
                        <p
                            :class="{
                                'no-wrap': !cprops.break,
                                'break-words': cprops.break,
                            }"
                        >
                            {{ row[cprops.name] }}
                        </p>
                    </td>
                    <td v-if="actions">
                        <button
                            v-for="(action, aidx) in actions"
                            :key="aidx"
                            @click="(evt) => action.onClick(row, evt)"
                        >
                            {{ action.text }}
                        </button>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr v-for="(row, row_idx) in data" :key="row_idx">
                    <td>
                        <input
                            type="checkbox"
                            v-model="checkedValues"
                            :value="
                                checkboxIndex ? row[checkboxIndex] : row_idx
                            "
                            @change="emitCheckboxUpdate"
                        />
                    </td>
                    <td
                        v-for="(gprops, col_idx) in shorten"
                        :class="gprops.className"
                        :key="col_idx"
                    >
                        <p v-for="cidx in gprops.cols" :key="cidx">
                            <b v-if="gprops.cols.length > 1"
                                >{{ cols[cidx].label }}:
                            </b>
                            {{ row[cols[cidx].name] }}
                        </p>
                    </td>
                    <td v-if="actions">
                        <button
                            v-for="(action, aidx) in actions"
                            :key="aidx"
                            @click="(evt) => action.onClick(row, evt)"
                        >
                            {{ action.text }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <template v-else>
            <h3>
                <input
                    type="checkbox"
                    :checked="bulkCheckboxState === true"
                    :indeterminate="bulkCheckboxState === 'indeterminate'"
                    @change="onBulkCheckboxChange"
                />
                Items
            </h3>
            <div class="items">
                <div v-for="(row, row_idx) in data" :key="row_idx" class="item">
                    <input
                        type="checkbox"
                        v-model="checkedValues"
                        :value="checkboxIndex ? row[checkboxIndex] : row_idx"
                        @change="emitCheckboxUpdate"
                    />
                    <p v-for="(cprops, col_idx) in cols" :key="col_idx">
                        <b>{{ cprops.label }}: </b>
                        {{ row[cprops.name] }}
                    </p>
                    <div v-if="actions">
                        <button
                            v-for="(action, aidx) in actions"
                            :key="aidx"
                            @click="(evt) => action.onClick(row, evt)"
                        >
                            {{ action.text }}
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.table-wrapper {
    position: relative;
    max-width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
}
.resize-active {
    cursor: col-resize;
}
table {
    border-collapse: separate;
    border-spacing: 0 4px;
    table-layout: fixed;
    width: auto;
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

.collapsed table th:nth-of-type(2),
.collapsed table td:nth-of-type(2) {
    position: sticky;
    left: 0;
    z-index: 3;
}

.collapsed table th:last-child,
.collapsed table td:last-child {
    position: sticky;
    right: 0;
    z-index: 3;
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

@media screen and (max-width: 400px) {
    .transformed table,
    .shorten table {
        max-width: 100%;
    }

    table {
        border-spacing: 0;
    }

    th {
        border-bottom: 1px solid var(--clr-bg);
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }

    td {
        border-radius: 0 !important;
    }
    tr:last-child td:first-child {
        border-bottom-left-radius: 8px !important;
    }
    tr:last-child td:last-child {
        border-bottom-right-radius: 8px !important;
    }
}

h3 {
    padding: 1rem;
    margin: 0 1rem;
}
.items .item {
    margin: 1rem;
    background: white;
    border-radius: 1rem;
    padding: 1rem;
}
</style>
