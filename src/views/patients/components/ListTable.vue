<script lang="ts" setup>
import TableX from "@/components/table/TableX.vue";
import { useRouter } from "vue-router";
import { dateToDMY, SortType } from "@/helpers/utils";
import PatientDropdown from "./PatientDropdown.vue";
import { ref } from "vue";

const router = useRouter();
const props = defineProps<{
    isLoading: boolean;
    patients: any[];
    limit: number;
    tableDescription: any;
    sortBy: (sortByCol: string) => void;
    sortState: { by: string; order: SortType };
    config: any;
    onDelete: (patient: any) => void;
    search: string;
}>();

const emit = defineEmits<{
    (e: 'config', value: any): void
}>();

const draggedColumn = ref<string | null>(null);
const dragOverColumn = ref<string | null>(null);

const handleDragStart = (column: string) => {
    if (column === "actions") {
        return;
    }
    draggedColumn.value = column;
};

const handleDragOver = (e: DragEvent, column: string) => {
    e.preventDefault();
    dragOverColumn.value = column;
};

const handleDragLeave = () => {
    dragOverColumn.value = null;
};

const handleDrop = (e: DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!draggedColumn.value || draggedColumn.value === targetColumn || targetColumn === "actions") {
        return;
    }

    const newShow = [...props.config.show];
    const draggedIndex = newShow.indexOf(draggedColumn.value);
    const targetIndex = newShow.indexOf(targetColumn);
    
    newShow.splice(draggedIndex, 1);
    newShow.splice(targetIndex, 0, draggedColumn.value);
    
    emit('config', {
        ...props.config,
        show: newShow
    });

    draggedColumn.value = null;
    dragOverColumn.value = null;
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
</script>
<template>
    <div
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
            :visibleColumns="config.show"
            :trAttrs="
                (patient) => ({
                    class: 'patient-row',
                    onClick: () => goToReport(patient),
                })
            "
        >
            <template #header="{ info, column }">
                <th 
                    class="list-one-line" 
                    :title="info.label"
                    draggable="true"
                    @dragstart="handleDragStart(column)"
                    @dragover="(e) => handleDragOver(e, column)"
                    @dragleave="handleDragLeave"
                    @drop="(e) => handleDrop(e, column)"
                    :class="{ 'drag-over': dragOverColumn === column }"
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
    }
    thead tr {
        border-bottom-width: 2px;
    }

    th {
        font-size: var(--fs-base);
        cursor: move;
        transition: background-color 0.2s ease;
        
        &.drag-over {
            background-color: var(--clr-accent-light);
        }
        
        &:hover {
            background-color: var(--clr-accent-light);
        }
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
</style>
