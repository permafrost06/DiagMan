<script lang="ts" setup>
import TableX from "@/components/table/TableX.vue";
import { useRouter } from "vue-router";
import { dateToDMY, SortType } from "@/helpers/utils";
import PatientDropdown from "./PatientDropdown.vue";
import { onMounted, onUnmounted, ref } from "vue";

const router = useRouter();
const props = defineProps<{
    isLoading: boolean;
    patients: any[];
    limit: number;
    tableDescription: any;
    sortBy: (sortByCol: string) => void;
    sortState: { by: string; order: SortType };
    config: {
        show: string[];
        sizes: Record<string, string>;
    };
    onDelete: (patient: any) => void;
    search: string;
}>();

const emit = defineEmits<{
    (e: "config", value: any): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const draggedColumn = ref<string | null>(null);
const dragOverColumn = ref<string | null>(null);
const colXPositions = ref<number[]>([]);
const dragGhost = ref<HTMLElement | null>(null);
const tmpColOrder = ref<string[] | null>(null);

const resizingColumn = ref<string | null>(null);
const startWidth = ref<number | null>(null);
const startX = ref<number | null>(null);

const hasOpenedDropdown = ref<boolean>(false);

const createColumnGhost = (column: string) => {
    const table = containerRef.value?.querySelector("table");
    if (!table) return;
    const colIndex = props.config.show.indexOf(column);
    if (colIndex === -1) return;

    const ghost = document.createElement("table");
    ghost.className = "drag-column-ghost";

    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
        const cell = row.children[colIndex];
        if (cell) {
            const computedStyle = getComputedStyle(cell);
            const ghostRow = ghost.insertRow();
            const clone = cell.cloneNode(true) as HTMLElement;
            clone.style.width = computedStyle.width;
            clone.style.height = computedStyle.height;
            clone.style.lineHeight = computedStyle.lineHeight;
            clone.style.padding = computedStyle.padding;
            ghostRow.appendChild(clone);
        }
    });

    document.body.appendChild(ghost);
    ghost.style.top = `${table.getBoundingClientRect().top}px`;
    dragGhost.value = ghost;
};

const handleMove = (e: MouseEvent) => {
    const x = e.clientX;
    if (dragGhost.value) {
        dragGhost.value.style.left = `${e.clientX + 10}px`;
    }
    if (!draggedColumn.value || !colXPositions.value.length) return;
    let closestIndex = -1;
    for (let i = colXPositions.value.length - 1; i >= 0; i--) {
        if (closestIndex < 0 && x > colXPositions.value[i]) {
            closestIndex = i;
        }
    }
    const targetColumn = props.config.show[closestIndex];
    if (targetColumn) {
        const oldTargetColumn = dragOverColumn.value;
        dragOverColumn.value = targetColumn;
        if (oldTargetColumn !== targetColumn) {
            makeTheMove();
        }
    }
};

const calculateColPositions = () => {
    const tableEl = containerRef.value?.querySelector("table");
    if (!tableEl) return;
    const firstRow = tableEl.querySelector("tr");
    const colPositions: number[] = [];
    Array.from(firstRow?.children || []).forEach((cell) => {
        const box = cell.getBoundingClientRect();
        colPositions.push(box.left);
    });
    colXPositions.value = colPositions;
};

const handleDragStart = (column: string) => {
    const tableEl = containerRef.value?.querySelector("table");
    if (column === "actions" || !tableEl) {
        return;
    }
    draggedColumn.value = column;
    dragOverColumn.value = column;
    tmpColOrder.value = props.config.show.slice();

    calculateColPositions();
    createColumnGhost(column);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleDrop);
};

const makeTheMove = () => {
    const targetColumn = dragOverColumn.value;
    const movingColumn = draggedColumn.value;
    if (!targetColumn || !movingColumn || targetColumn === "actions") {
        return;
    }

    const newShow = [...props.config.show];
    const draggedIndex = newShow.indexOf(movingColumn);
    const targetIndex = newShow.indexOf(targetColumn);

    newShow.splice(draggedIndex, 1);
    newShow.splice(targetIndex, 0, movingColumn);

    tmpColOrder.value = newShow;
};

const handleDrop = (e: MouseEvent) => {
    e.preventDefault();
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleDrop);

    if (dragGhost.value) {
        dragGhost.value.remove();
        dragGhost.value = null;
    }

    const targetColumn = dragOverColumn.value;
    const movingColumn = draggedColumn.value;
    if (
        !targetColumn ||
        !movingColumn ||
        targetColumn === movingColumn ||
        targetColumn === "actions"
    ) {
        draggedColumn.value = null;
        dragOverColumn.value = null;
        return;
    }

    emit("config", {
        ...props.config,
        show: tmpColOrder.value || props.config.show,
    });

    tmpColOrder.value = null;
    colXPositions.value = [];
    draggedColumn.value = null;
    dragOverColumn.value = null;
};

const handleResizeStart = (e: MouseEvent, column: string) => {
    e.preventDefault();
    resizingColumn.value = column;
    startX.value = e.clientX;
    startWidth.value = parseInt(props.config.sizes[column] || "100px");

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
};

const handleResizeMove = (e: MouseEvent) => {
    if (
        !resizingColumn.value ||
        startX.value === null ||
        startWidth.value === null
    )
        return;

    const delta = e.clientX - startX.value;
    const newWidth = Math.max(50, startWidth.value + delta);

    emit("config", {
        ...props.config,
        sizes: {
            ...props.config.sizes,
            [resizingColumn.value]: `${newWidth}px`,
        },
    });
};

const handleResizeEnd = () => {
    resizingColumn.value = null;
    startX.value = null;
    startWidth.value = null;

    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
};

const hightlightText = (data: string): string => {
    let colH = data;
    if (props.search) {
        colH = colH.replace(new RegExp(props.search, "i"), (a) => {
            return `<mark>${a}</mark>`;
        });
    }
    return colH;
};

const goToReport = (patient: Record<string, any>) => {
    if (hasOpenedDropdown.value) {
        return;
    }
    router.push({ name: "report", params: { id: patient.id } });
};

const getStatus = (patient: Record<any, any>) => {
    if (patient.status === "delivered") {
        return "Archived";
    }

    if (patient.locked) {
        return "Locked";
    }

    return hightlightText(patient.status);
};

const onOpenDropdown = () => {
    hasOpenedDropdown.value = true;
};

const onCloseDropdown = () => {
    hasOpenedDropdown.value = false;
};

onMounted(() => {
    document.addEventListener("click", onCloseDropdown);
    document.addEventListener("patient-dropdown-open", onOpenDropdown);
});

onUnmounted(() => {
    document.removeEventListener("click", onCloseDropdown);
    document.removeEventListener("patient-dropdown-open", onOpenDropdown);
});
</script>
<template>
    <div
        ref="containerRef"
        :class="{
            'table-has-name': config.show.includes('name'),
            'table-is-loading': isLoading,
        }"
    >
        <TableX
            width="100%"
            :data="patients"
            :rows="limit"
            :state="isLoading ? 'loading' : 'ok'"
            :header="tableDescription"
            :visibleColumns="tmpColOrder || config.show"
            :dragging="draggedColumn"
            :trAttrs="
                (patient) => ({
                    class: 'patient-row',
                    onClick: () => goToReport(patient),
                })
            "
        >
            <template #before-header>
                <colgroup>
                    <col
                        v-for="col in tmpColOrder || config.show"
                        :style="{
                            width: config.sizes[col],
                            border:
                                draggedColumn === col
                                    ? '2px dashed var(--clr-black)'
                                    : undefined,
                        }"
                    />
                </colgroup>
            </template>
            <template #header="{ info, column }">
                <th
                    class="list-one-line"
                    :title="info.label"
                    @mousedown.prevent="handleDragStart(column)"
                >
                    <div class="th-actionable">
                        <p>{{ info.label }}</p>
                        <div class="actions">
                            <button
                                v-if="info.sort"
                                @click="() => sortBy(column as any)"
                            >
                                <svg
                                    v-if="sortState.by !== column"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="10"
                                    height="10"
                                    viewBox="0 0 2048 2048"
                                >
                                    <path
                                        fill="currentColor"
                                        d="m1069 499l-90 90l-338-337l-1 1796H512l1-1799l-340 340l-90-90L576 6l493 493zm807 960l91 90l-493 493l-494-493l91-90l338 338l-1-1797h128l1 1798l339-339z"
                                    />
                                </svg>
                                <svg
                                    v-else-if="sortState.order === 'asc'"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 15 15"
                                >
                                    <path
                                        fill="currentColor"
                                        fill-rule="evenodd"
                                        d="M8 1v11.293l3.146-3.147l.708.708L7.5 14.207L3.146 9.854l.708-.708L7 12.293V1h1Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 15 15"
                                >
                                    <path
                                        fill="currentColor"
                                        fill-rule="evenodd"
                                        d="m7.5.793l4.354 4.353l-.707.708L8 2.707V14H7V2.707L3.854 5.854l-.708-.708L7.5.793Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <template v-if="column !== 'actions'">
                        <div
                            class="resize-handle resize-handle-right"
                            @mousedown="(e) => handleResizeStart(e, column)"
                        ></div>
                    </template>
                </th>
            </template>
            <template #col.name="{ row: patient }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line">
                    <p
                        v-html="hightlightText(patient.name)"
                        :title="patient.name"
                    />
                    <p class="small-id" v-html="hightlightText(patient.id)" />
                </td>
            </template>
            <template #col.type="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line capitalize">
                    {{ `${cell}pathology` }}
                </td>
            </template>
            <template #col.age="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line">{{ cell }}</td>
            </template>
            <template #col.gender="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line capitalize">{{ cell }}</td>
            </template>
            <template #col.contact="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line" :title="cell">
                    {{ cell }}
                </td>
            </template>

            <template #col.timestamp="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line">
                    {{ cell ? dateToDMY(new Date(parseInt(cell))) : "N/A" }}
                </td>
            </template>
            <template #col.delivery_date="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line">
                    {{ cell ? dateToDMY(new Date(parseInt(cell))) : "N/A" }}
                </td>
            </template>
            <template #col.specimen="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line" :title="cell">
                    {{ cell }}
                </td>
            </template>
            <template #col.referer="{ cell }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line" :title="cell">
                    {{ cell }}
                </td>
            </template>
            <template #col.status="{ row }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else class="list-one-line capitalize">
                    {{ getStatus(row) }}
                </td>
            </template>
            <template #col.actions="{ row: patient }">
                <td v-if="isLoading">
                    <div class="skeleton"></div>
                </td>
                <td v-else>
                    <PatientDropdown :patient="patient" @delete="onDelete" />
                </td>
            </template>
        </TableX>
    </div>
</template>
<style lang="scss">
table {
    border-collapse: collapse;
    table-layout: fixed;
    max-width: 100%;

    .list-one-line {
        &,
        & * {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }

    tr {
        border-bottom: 1px solid var(--clr-black);
        &:first-child {
            border-bottom-width: 2px;
        }
    }

    th {
        font-size: var(--fs-base);
        cursor: move;
        transition: background-color 0.2s ease;
    }

    th,
    td {
        padding: 8px 15px;
        text-align: left;
    }
    .print-btns {
        position: relative;
        > button {
            height: 100%;
            svg {
                pointer-events: none;
            }
        }
        .dropdown {
            display: none;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: calc(100% + 10px);
            z-index: 1;
            background: var(--clr-black);

            a {
                margin: 5px;
            }

            .divider {
                background: var(--clr-white);
                height: 1px;
                width: calc(100% - 10px);
                margin: auto;

                &:first-child {
                    display: none;
                }
            }

            &:after {
                content: "";
                position: absolute;
                top: 50%;
                left: 100%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-left: 10px solid var(--clr-black);
            }
        }

        &.expanded .dropdown {
            display: block;
        }
    }
}

.table-is-loading {
    td {
        height: 46px;
    }

    &.table-has-name {
        td {
            height: 56px;
        }
    }
}

.row-actions {
    cursor: default;

    button,
    .btn {
        padding: 5px 15px;
        font-weight: 600;
        gap: 5px;
    }

    .dropdown-button {
        width: 4.5rem;

        .dropdown .btn {
            width: 4.5rem;
        }
    }
}

.skeleton.btn {
    height: 1.5em;
    width: 100%;
}

.th-actionable {
    display: flex;
    align-items: center;
}

.th-actionable > p {
    flex-grow: 1;
    text-align: left;
}

.th-actionable > .actions {
    display: flex;
}
.th-actionable > .actions > button {
    color: var(--clr-black);
    background: transparent;
    padding: 0;
}

.small-id {
    font-size: 0.75rem;
}

.patient-row {
    cursor: pointer;

    &:hover {
        background-color: rgba(89, 89, 89, 0.05);
    }
}

.resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background: var(--clr-accent-light);
    opacity: 0.3;
    transition: opacity 0.2s ease;

    &::before {
        content: "";
        position: absolute;
        top: 50%;
        height: 20px;
        left: 0;
        right: 0;
        transform: translateY(-50%);
        border: 1px solid var(--clr-black);
        border-top: none;
        border-bottom: none;
    }

    &.resize-handle-left {
        left: 2px;
    }

    &.resize-handle-right {
        right: 2px;
    }
}

th {
    position: relative;
}
.drag-column-ghost {
    position: fixed;
    pointer-events: none;
    background: white;
    border: 1px solid black;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 9999;
}
</style>
