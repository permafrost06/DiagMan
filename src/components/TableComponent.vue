<script setup lang="ts">
import {
    onMounted,
    onUnmounted,
    onUpdated,
    ref,
    type TableHTMLAttributes,
} from "vue";

export type TableCol = {
    label: string;
    name: string;
    className?: string;
    thClass?: string;
    width?: string;
    break?: boolean;
    doNotRemove?: boolean;
};

export interface RowAction {
    text: string;
    onClick: (row: any, evt: Event) => void;
}

export interface TableProps extends TableHTMLAttributes {
    cols: TableCol[];
    data: any[];
    mobileView?: "moveable" | "collapsed" | "transformed" | "shorten";
    breakpoint?: number;
    actions?: RowAction[];
}

const props = withDefaults(defineProps<TableProps>(), {
    mobileView: "moveable",
    breakpoint: 600,
});

const tableRef = ref<HTMLTableElement>();
const curCols = ref<TableCol[]>(props.cols);
const windowSize = ref<number>(0);
const checkBoxRef = ref<HTMLInputElement>();
const checkBoxState = ref<boolean | "indeterminate">(false);

const data = ref<any[]>(props.data);

onMounted(() => {
    window.addEventListener("mouseup", dragEnd);
    windowSize.value = window.innerWidth;
    setupResize();

    if (props.mobileView === "shorten") {
        window.addEventListener("resize", shortenEvt);
    } else if (props.mobileView === "transformed") {
        window.addEventListener("resize", () => {
            windowSize.value = window.innerWidth;
        });
    }
});

onUnmounted(() => {
    window.removeEventListener("mouseup", dragEnd);
    if (props.mobileView === "shorten") {
        window.removeEventListener("resize", shortenEvt);
    }
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

let lastShortenExec: number = 0;
function shortenEvt() {
    if (lastShortenExec) {
        clearTimeout(lastShortenExec);
    }
    lastShortenExec = setTimeout(hideColOnScreenWidthChange, 1000);
}

function hideColOnScreenWidthChange() {
    curCols.value.pop();
    /**
     * Other strategies i.e. using importance hireachy,
     * largest col first can be used to remove columngs
     */
}

let initialX = 0,
    initialWidth = 0,
    activeEl: HTMLTableCellElement;

const changeWidth = (event: MouseEvent) => {
    event.preventDefault();
    const distance = event.x - initialX;
    const width = initialWidth + distance + "px";
    activeEl.style.minWidth = width;
    activeEl.style.minWidth = width;
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

    data.value = data.value.map((item, index) => {
        if (index == idx) {
            item.checked = value;
        }
        if (!item.checked) {
            allChecked = false;
        } else {
            allNotCheked = false;
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
};

const bulkCheckChange = (evt: Event) => {
    //@ts-ignore
    const value = evt.target.checked;
    checkBoxState.value = value;
    data.value = data.value.map((item) => {
        item.checked = value;
        return item;
    });
};
</script>

<template>
    <div
        :class="{
            'table-wrapper': true,
            transformed: mobileView === 'transformed',
            moveable: mobileView === 'moveable',
            collapsed: mobileView === 'collapsed',
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
                            :checked="checkBoxState === true"
                            :indeterminate="checkBoxState === 'indeterminate'"
                            @click="bulkCheckChange"
                            ref="checkBoxRef"
                        />
                    </th>
                    <th
                        v-for="(cprops, idx) in curCols"
                        :style="`width: ${cprops.width}`"
                        :class="cprops.thClass"
                        :key="idx"
                    >
                        {{ cprops.label }}
                        <div class="resizer"></div>
                    </th>
                    <th v-if="actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, row_idx) in data" :key="row_idx">
                    <td>
                        <input
                            type="checkbox"
                            :checked="row.checked"
                            @change="(evt) => onRowCheckBoxChange(evt, row_idx)"
                        />
                    </td>
                    <td
                        v-for="(cprops, col_idx) in curCols"
                        :class="cprops.className"
                        :key="col_idx"
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
        </table>
        <template v-else>
            <h3>
                <input
                    type="checkbox"
                    :checked="checkBoxState === true"
                    :indeterminate="checkBoxState === 'indeterminate'"
                    @click="bulkCheckChange"
                    ref="checkBoxRef"
                />
                Items
            </h3>
            <div class="items">
                <div v-for="(row, row_idx) in data" :key="row_idx" class="item">
                    <input
                        type="checkbox"
                        :checked="row.checked"
                        @change="(evt) => onRowCheckBoxChange(evt, row_idx)"
                    />
                    <p v-for="(cprops, col_idx) in curCols" :key="col_idx">
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
    overflow: hidden;
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

.collapsed,
.moveable {
    overflow: auto;
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

.transformed table {
    max-width: 100%;
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
