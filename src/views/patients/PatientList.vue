<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import Pagination from "@/components/Pagination.vue";
import Icon from "@/components/base/Icon.vue";
import SearchFilter from "@/components/SearchFilter.vue";
import ThActionable from "@/components/base/ThActionable.vue";
import ConfirmModal from "@/components/modal/ConfirmModal.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import {
    TABLES,
    getRowCount,
    getRows,
    insertRowBulk,
} from "@/helpers/local-db";
import type { Sorting } from "@/helpers/utils";
import { useUser } from "@/stores/user";
import { onMounted, ref, watch } from "vue";
import Loading from "@/Icons/Loading.vue";

const user = useUser();
const isLoading = ref<boolean>(false);
const deleteValue = ref();
const isDeleting = ref<boolean>(false);
const error = ref<string | null>(null);
const patients = ref<Array<Record<string, string>>>([]);
const page = ref({
    maxPage: 1,
    page: 1,
});
const sortState = ref<Sorting>({
    by: "delivery_date",
    order: "desc",
});
type TableNames = "id" | "name" | "type" | "delivery_date" | "status";
const filters = ref("");
const filterRef = ref();

let queryParams: Record<string, string> = {};

const tableDescription = {
    id: "ID",
    name: "Name",
    type: "Type",
    delivery_date: {
        label: "Delivery Date",
        filter: false,
    },
    status: "Status",
};

const sortBy = (newSortState: Sorting<string>) => {
    sortState.value = newSortState;
    queryResults();
};
const showFilter = (col: string) => {
    filterRef.value.setCursor(col);
};

const filterChange = (val: Record<string, string>) => {
    queryParams = val;
    page.value.page = 1;
    queryResults();
};

const hightlightText = (data: string, col: string): string => {
    let colH = data;
    const colStr = queryParams[col];
    if (colStr) {
        colH = colH.replace(new RegExp(colStr, "i"), (a) => {
            return `<mark>${a}</mark>`;
        });
    }
    const allStr = queryParams.all;
    if (allStr) {
        colH = colH.replace(new RegExp(allStr, "i"), (a) => {
            return `<mark>${a}</mark>`;
        });
    }
    return colH;
};

onMounted(queryResults);
watch(page.value, queryResults);

async function queryResults() {
    if (!navigator.onLine) {
        patients.value = getRows(TABLES.patients);
        return;
    }

    isLoading.value = true;
    queryParams.page = page.value.page.toString();
    queryParams.order_by = sortState.value.by;
    queryParams.order = sortState.value.order;
    const qs = new URLSearchParams(queryParams);
    const res = await fetchApi(`${API_BASE}/patients?${qs.toString()}`);
    isLoading.value = false;

    if (!res.success) {
        error.value = res.message;
    } else {
        patients.value = res.rows || [];
        if (getRowCount(TABLES.patients) === 0) {
            insertRowBulk(TABLES.patients, patients.value);
        }
        page.value.page = res.pagination!.page;
        page.value.maxPage = res.pagination!.maxPage;
    }
}

async function deletePatient() {
    if (!deleteValue.value || isDeleting.value) {
        return;
    }
    isDeleting.value = true;
    const res = await fetchApi(`${API_BASE}/patients/${deleteValue.value.id}`, {
        method: "DELETE",
        body: JSON.stringify({
            id: deleteValue.value?.id,
        }),
    });
    isDeleting.value = false;
    if (res.success) {
        error.value = null;
        patients.value = patients.value.filter(
            (p) => p.id != deleteValue.value?.id
        );
        deleteValue.value = null;
    } else {
        error.value = res.message;
    }
}

const lockReqs = ref<Set<number>>(new Set());
const toggleLock = async (patient: any) => {
    if (lockReqs.value.has(patient.id)) {
        return;
    }
    lockReqs.value.add(patient.id);

    const res = await fetchApi(API_BASE + "/reports/lock/" + patient.id, {
        method: "POST",
    });
    lockReqs.value.delete(patient.id);
    if (!res.success) {
        console.error(res.message || "Toggling report lock failed!");
        return;
    }
    patient.locked = !patient.locked;
};

const deliverReqs = ref<Set<number>>(new Set());
const deliverReport = async (patient: any) => {
    if (deliverReqs.value.has(patient.id)) {
        return;
    }
    deliverReqs.value.add(patient.id);
    const res = await fetchApi(API_BASE + "/reports/deliver/" + patient.id, {
        method: "POST",
    });
    deliverReqs.value.delete(patient.id);
    if (!res.success) {
        console.error(res.message || "Delivering report failed!");
        return;
    }
    patient.status = "delivered";
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});
</script>
<template>
    <div class="patients-page">
        <div class="patients-header">
            <div class="flex items-center">
                <h1 class="fs-2xl">Patient List</h1>
            </div>
            <div class="flex items-center">
                <p class="h-user-name font-h">{{ user.name }}</p>
                <!-- <button class="h-icon-btn">
                    <Icon size="24" viewBox="24">
                        <path
                            fill="currentColor"
                            d="M2 4h1v16h2V10h4v10h2V6h4v14h2v-6h4v7H2V4m16 11v5h2v-5h-2m-6-8v13h2V7h-2m-6 4v9h2v-9H6Z"
                        />
                    </Icon>
                </button>
                <button class="h-icon-btn">
                    <Icon size="24" viewBox="24">
                        <path
                            fill="currentColor"
                            d="M10 21h4c0 1.1-.9 2-2 2s-2-.9-2-2m11-2v1H3v-1l2-2v-6c0-3.1 2-5.8 5-6.7V4c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6l2 2m-4-8c0-2.8-2.2-5-5-5s-5 2.2-5 5v7h10v-7Z"
                        />
                    </Icon>
                </button> -->
                <RouterLink
                    :to="{ name: 'settings' }"
                    class="h-icon-btn flex items-center"
                >
                    <Icon size="24" viewBox="24">
                        <path
                            fill="currentColor"
                            d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
                        />
                    </Icon>
                </RouterLink>
            </div>
        </div>
        <div class="query-info">
            <RouterLink
                :to="{ name: 'patients.add' }"
                class="btn h-link-btn font-h"
            >
                + Add Patient
            </RouterLink>
            <SearchFilter
                ref="filterRef"
                placeholder="Search..."
                v-model="filters"
                :on-update="filterChange"
            />
            <div class="query-item">
                <Icon size="10" viewBox="2048">
                    <path
                        fill="currentColor"
                        d="m1069 499l-90 90l-338-337l-1 1796H512l1-1799l-340 340l-90-90L576 6l493 493zm807 960l91 90l-493 493l-494-493l91-90l338 338l-1-1797h128l1 1798l339-339z"
                    />
                </Icon>
                <p>
                    Sort: &quot;{{
                        (tableDescription[sortState.by as TableNames] as any)
                            .label ||
                        tableDescription[sortState.by as TableNames]
                    }}&quot; ({{ sortState.order === "asc" ? "A-Z" : "Z-A" }})
                </p>
            </div>
        </div>
        <div>
            <table width="100%">
                <tr class="font-h">
                    <ThActionable
                        :description="tableDescription"
                        :on-filter="showFilter"
                        :on-sort="sortBy"
                        sort-by="delivery_date"
                        sort-order="desc"
                    />
                    <th>Actions</th>
                </tr>
                <template v-if="isLoading">
                    <tr v-for="i in 10" :key="i" :class="'skeleton-' + (i % 4)">
                        <td>
                            <div class="skeleton"></div>
                        </td>
                        <td>
                            <div class="skeleton"></div>
                        </td>
                        <td>
                            <div class="skeleton"></div>
                        </td>
                        <td>
                            <div class="skeleton"></div>
                        </td>
                        <td>
                            <div class="skeleton"></div>
                        </td>
                        <td class="flex items-center gap-sm">
                            <div class="skeleton btn"></div>
                            <div class="skeleton btn"></div>
                            <div class="skeleton btn"></div>
                        </td>
                    </tr>
                </template>
                <tr v-else-if="!patients?.length">
                    <td colspan="6">{{ error || "No patients added yet!" }}</td>
                </tr>
                <template v-else>
                    <tr v-for="patient in patients" :key="patient.id">
                        <td v-html="hightlightText(patient.id, 'id')"></td>
                        <td v-html="hightlightText(patient.name, 'name')"></td>
                        <td
                            class="capitalize"
                            v-html="
                                hightlightText(patient.type, 'type') +
                                'pathology'
                            "
                        ></td>
                        <td>
                            {{
                                dateFormatter.format(
                                    parseInt(patient.delivery_date)
                                )
                            }}
                        </td>
                        <td
                            class="flex capitalize items-center"
                            v-html="hightlightText(patient.status, 'status')"
                        ></td>
                        <td>
                            <div class="flex gap-sm row-actions">
                                <RouterLink
                                    :to="{
                                        name: 'report',
                                        params: {
                                            id: patient.id,
                                        },
                                    }"
                                    class="btn report-btn"
                                >
                                    Report
                                </RouterLink>
                                <RouterLink
                                    :to="{
                                        name: 'patients.invoice',
                                        params: {
                                            id: patient.id,
                                        },
                                    }"
                                    class="btn"
                                >
                                    Invoice
                                </RouterLink>
                                <button
                                    v-if="user.isAdmin && patient.is_reported"
                                    type="button"
                                    class="btn-outline"
                                    @click="() => toggleLock(patient)"
                                >
                                    <Loading
                                        size="15"
                                        v-if="lockReqs.has(patient.id as any)"
                                    />
                                    {{ patient.locked ? "Unlock" : "Lock" }}
                                </button>
                                <button
                                    v-if="patient.status === 'complete'"
                                    type="button"
                                    class="btn-outline"
                                    @click="() => deliverReport(patient)"
                                >
                                    <Loading
                                        size="15"
                                        v-if="deliverReqs.has(patient.id as any)"
                                    />
                                    Mark as delivered
                                </button>
                                <RouterLink
                                    :to="{
                                        name: 'patients.edit',
                                        params: {
                                            id: patient.id,
                                        },
                                    }"
                                    class="btn btn-outline"
                                >
                                    Edit
                                </RouterLink>
                                <button
                                    class="btn-outline danger"
                                    @click="deleteValue = patient"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
        <Pagination :pages="page.maxPage" v-model="page.page" class="mt-sm" />
    </div>
    <ConfirmModal title="Are you sure?" icon="delete" v-if="deleteValue">
        <p v-if="error" class="form-alert error">{{ error }}</p>
        <p>
            Are you sure to delete the patient named
            <span class="bold"> {{ deleteValue.name }} </span>?
        </p>
        <p class="danger fs-md bold">It cannot be undone!</p>
        <template v-slot:buttons>
            <button @click="deletePatient">
                <Loading v-if="isDeleting" size="15" />
                Delete
            </button>
            <button class="btn-outline" @click="deleteValue = null">
                Cancel
            </button>
        </template>
    </ConfirmModal>
</template>

<style lang="scss">
.patients-page {
    padding: 30px;
}
.patients-page .h-link-btn {
    background: var(--clr-black);
    color: var(--clr-white);
}
.patients-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}
.patients-header .site-name {
    font-weight: bold;
    font-size: var(--fs-xl);
}
.patients-header .h-icon-btn {
    background: transparent;
    color: var(--clr-black);
    padding: 5px;
}
.patients-header .h-icon-btn:hover {
    color: var(--clr-accent);
}
.patients-header .h-user-name {
    font-weight: bold;
    margin-right: 10px;
}

.query-info {
    display: grid;
    grid-template-columns: max-content auto max-content;
    gap: var(--space-sm);
    padding: 15px 10px;
}
.query-item {
    display: flex;
    align-items: center;
    border: 1px solid var(--clr-black);
    padding: 3px 5px;
    font-size: var(--fs-sm);
    gap: 5px;
}

.query-item button {
    padding: 0;
    background: transparent;
    color: var(--clr-black);
}

.query-item button:hover {
    color: var(--clr-danger);
}

.patients-page table {
    border-collapse: collapse;
}
.patients-page table tr {
    border-bottom: 1px solid var(--clr-black);
}
.patients-page table tr:first-child {
    border-bottom-width: 2px;
}
.patients-page table th {
    font-size: var(--fs-base);
}

.patients-page table th,
.patients-page table td {
    padding: 8px 15px;
    text-align: left;
}

.patients-page .row-actions {
    button,
    .btn {
        padding: 5px 15px;
        font-weight: 600;
        gap: 5px;
    }
    // .report-btn {
    //     padding-left: 10px;
    // }
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
</style>
