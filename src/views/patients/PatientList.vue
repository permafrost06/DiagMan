<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import Pagination from "@/components/Pagination.vue";
import Icon from "@/components/base/Icon.vue";
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
import { dateToDMY, useSorter } from "@/helpers/utils";
import { useUser } from "@/stores/user";
import { onMounted, onUnmounted, ref, watch } from "vue";
import Loading from "@/Icons/Loading.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import { useRouter } from "vue-router";

const user = useUser();
const isLoading = ref<boolean>(false);
const deleteValue = ref();
const isDeleting = ref<boolean>(false);
const error = ref<string | null>(null);
const patients = ref<Array<Record<string, string>>>([]);
const showDelivered = ref<boolean>(false);
const page = ref({
    maxPage: 1,
    page: 1,
});
const [sortState, doSorting] = useSorter<string>("timestamp", "desc");
type TableNames = "id" | "name" | "type" | "delivery_date" | "status";
const filterRef = ref();

let queryParamsH: Record<string, string> = {};
let queryParamsF: Record<string, string> = {};

const sortableColumns = {
    id: {
        label: "ID",
    },
    name: {
        label: "Name",
    },
    contact: {
        label: "Contact No",
    },
    timestamp: {
        label: "Date Added (Default)",
    },
    type: {
        label: "Type",
    },
    delivery_date: {
        label: "Delivery Date",
    },
};

const tableDescription = {
    name: {
        label: "Name",
        filter: false,
    },
    contact: {
        label: "Contact No",
        filter: false,
    },
    timestamp: {
        label: "Date Added",
        filter: false,
    },
    specimen: {
        label: "Specimen",
        filter: false,
    },
    status: {
        label: "Status",
        filter: false,
    },
};

const sortBy = (sortByCol: string) => {
    doSorting(sortByCol);
    queryResults();
};
const showFilter = (col: string) => {
    filterRef.value.setCursor(col);
};

const hightlightText = (data: string, col: string): string => {
    let colH = data;
    const colStr = queryParamsH[col];
    if (colStr) {
        colH = colH.replace(new RegExp(colStr, "i"), (a) => {
            return `<mark>${a}</mark>`;
        });
    }
    const allStr = queryParamsH.all;
    if (allStr) {
        colH = colH.replace(new RegExp(allStr, "i"), (a) => {
            return `<mark>${a}</mark>`;
        });
    }
    return colH;
};

let lastExpanded: HTMLElement | null = null;

const printBtnEvt = (evt: any) => {
    if (!lastExpanded) {
        return;
    }
    if (evt.target.closest(".print-btns") !== lastExpanded) {
        lastExpanded?.classList.remove("expanded");
        lastExpanded = null;
    }
};
onMounted(() => {
    queryResults();
    document.addEventListener("click", printBtnEvt);
});
onUnmounted(() => {
    document.removeEventListener("click", printBtnEvt);
});
watch(page.value, queryResults);
watch(showDelivered, queryResults);

async function queryResults() {
    if (!navigator.onLine) {
        patients.value = getRows(TABLES.patients);
        return;
    }

    isLoading.value = true;
    const queryParams = { ...queryParamsH, ...queryParamsF };
    queryParams.page = page.value.page.toString();
    queryParams.order_by = sortState.value.by;
    queryParams.order = sortState.value.order;
    const qs = new URLSearchParams(queryParams);

    if (showDelivered.value) {
        qs.append("delivered", "1");
    }

    const res = await fetchApi(`${API_BASE}/patients?${qs.toString()}`);
    isLoading.value = false;

    if (!res.success) {
        error.value = res.message;
        patients.value = [];
    } else {
        patients.value = res.rows || [];
        if (getRowCount(TABLES.patients) === 0) {
            insertRowBulk(TABLES.patients, patients.value);
        }
        page.value.page = res.pagination!.page;
        page.value.maxPage = res.pagination!.maxPage;
    }
}

const filterResult = (by: string, value: string) => {
    queryParamsF[by] = value;
    page.value.page = 1;
    queryResults();
};
const filterResultH = (by: string, value: string) => {
    queryParamsH[by] = value;
    page.value.page = 1;
    queryResults();
};

async function deletePatient() {
    if (!deleteValue.value || isDeleting.value) {
        return;
    }
    isDeleting.value = true;
    const res = await fetchApi(
        `${API_BASE}/patients/${encodeURIComponent(deleteValue.value.id)}`,
        {
            method: "DELETE",
            body: JSON.stringify({
                id: deleteValue.value?.id,
            }),
        }
    );
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

    const res = await fetchApi(
        API_BASE + "/reports/lock/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        }
    );
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
    const res = await fetchApi(
        API_BASE + "/reports/deliver/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        }
    );
    deliverReqs.value.delete(patient.id);
    if (!res.success) {
        console.error(res.message || "Delivering report failed!");
        return;
    }
    patient.status = "delivered";
    if (!showDelivered.value) {
        patients.value = patients.value.filter((p) => p.id != patient.id);
    }
};

const unDeliverReqs = ref<Set<number>>(new Set());
const unDeliverReport = async (patient: any) => {
    if (unDeliverReqs.value.has(patient.id)) {
        return;
    }
    unDeliverReqs.value.add(patient.id);
    const res = await fetchApi(
        API_BASE + "/reports/un-deliver/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        }
    );
    unDeliverReqs.value.delete(patient.id);
    if (!res.success) {
        console.error(res.message || "Unmarking as delivered failed!");
        return;
    }
    patient.status = res.data.status;
};
const expandPrintBtn = (evt: any) => {
    if (lastExpanded) {
        lastExpanded.classList.remove("expanded");
    }
    if (lastExpanded === evt.target.parentElement) {
        lastExpanded = null;
        return;
    }
    lastExpanded = evt.target.parentElement;
    lastExpanded?.classList.add("expanded");
};

const router = useRouter();
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

    return hightlightText(patient.status, "status");
};
</script>
<template>
    <div class="patients-page">
        <div class="patients-header">
            <div class="flex items-center">
                <h1 class="fs-2xl">Patient List</h1>
            </div>
            <div class="flex items-center">
                <div class="h-user-name font-h">
                    <p>{{ user.name }}</p>
                    <p class="h-user-role">{{ user.role }} - The Opinion</p>
                </div>
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
            <div class="search-filter">
                <Icon size="16" viewBox="512">
                    <path
                        fill="currentColor"
                        d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0 0 34.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 0 0 327.3 362.6l94.09 94.09a25 25 0 0 0 35.3-35.3ZM97.92 222.72a124.8 124.8 0 1 1 124.8 124.8a124.95 124.95 0 0 1-124.8-124.8Z"
                    />
                </Icon>
                <input
                    placeholder="Search ID and Name"
                    type="search"
                    @input="(evt: any) => filterResultH('all', evt.target.value)"
                />
            </div>
            <div class="query-item">
                <p>Filter:</p>
                <select
                    class="sort-by-selector"
                    @input="(evt: any) => filterResult('type', evt.target.value)"
                >
                    <option value="">All</option>
                    <option value="histo">Histopathology</option>
                    <option value="cyto">Cytopathology</option>
                </select>
            </div>
            <div class="query-item">
                <div style="width: 4rem">Sort by:</div>
                <select
                    class="sort-by-selector"
                    :value="sortState.by"
                    @change="(evt: any) => sortBy(evt.target.value)"
                >
                    <option
                        v-for="(col, col_name) in sortableColumns"
                        :key="col_name"
                        :value="col_name"
                    >
                        {{ col.label }}
                    </option>
                </select>
                <button
                    type="button"
                    class="sort-order-button"
                    @click="() => sortBy(sortState.by)"
                >
                    <Icon
                        size="14"
                        viewBox="16"
                        v-if="sortState.order === 'asc'"
                    >
                        <path
                            fill="currentColor"
                            d="M5.205 1.494a.75.75 0 0 0-1.41 0l-2 5.5a.75.75 0 1 0 1.41.512L3.389 7h2.222l.184.506a.75.75 0 1 0 1.41-.512zM3.935 5.5L4.5 3.945L5.066 5.5zM2 9.75A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 .592 1.21L4.284 13.5h1.967a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.592-1.21l2.559-3.29H2.75A.75.75 0 0 1 2 9.75M12.25 1a.75.75 0 0 1 .75.75v10.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l.72.72V1.75a.75.75 0 0 1 .75-.75"
                        />
                    </Icon>
                    <Icon size="14" viewBox="24" v-else>
                        <path
                            fill="currentColor"
                            d="M3.75 3a1 1 0 0 1 1-1H10a1 1 0 0 1 .8 1.6L6.75 9H10a1 1 0 1 1 0 2H4.75a1 1 0 0 1-.8-1.6L8 4H4.75a1 1 0 0 1-1-1m4.229 9.673a1 1 0 0 0-1.89 0l-2.793 8.069a1 1 0 0 0 1.89.654l.411-1.189H8.47l.412 1.19a1 1 0 0 0 1.89-.655zm-1.69 5.534l.745-2.15l.744 2.15zM17.5 2a1 1 0 0 1 1 1v15.586l1.793-1.793a1 1 0 0 1 1.414 1.414l-3.5 3.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l1.793 1.793V3a1 1 0 0 1 1-1"
                        />
                    </Icon>
                </button>
            </div>
        </div>
        <div>
            <table width="100%">
                <tr class="font-h">
                    <ThActionable
                        :description="tableDescription"
                        :on-filter="showFilter"
                        :on-sort="sortBy"
                        :sort-by="sortState.by"
                        :sort-order="sortState.order"
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
                    <td colspan="7">{{ error || "No patients added yet!" }}</td>
                </tr>
                <template v-else>
                    <tr
                        class="patient-row"
                        @click="() => goToReport(patient)"
                        v-for="patient in patients"
                        :key="patient.id"
                    >
                        <td>
                            <p v-html="hightlightText(patient.name, 'name')" />
                            <p
                                class="small-id"
                                v-html="hightlightText(patient.id, 'id')"
                            />
                        </td>
                        <td>{{ patient.contact }}</td>
                        <td>
                            {{
                                patient.timestamp
                                    ? dateToDMY(
                                          new Date(parseInt(patient.timestamp))
                                      )
                                    : "N/A"
                            }}
                        </td>
                        <td>
                            {{ patient.specimen }}
                        </td>
                        <td class="capitalize" v-html="getStatus(patient)"></td>
                        <td>
                            <div @click.stop class="flex gap-sm row-actions">
                                <div class="print-btns">
                                    <button
                                        class="dropdown-button"
                                        type="button"
                                        @click="expandPrintBtn"
                                    >
                                        Print
                                        <Icon size="16" viewBox="1024">
                                            ><path
                                                fill="currentColor"
                                                d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35"
                                            />
                                        </Icon>
                                    </button>
                                    <div class="dropdown">
                                        <RouterLink
                                            v-if="patient.is_reported"
                                            :to="{
                                                name: 'report.print',
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
                                    </div>
                                </div>
                                <button
                                    v-if="
                                        user.isAdmin &&
                                        patient.is_reported &&
                                        patient.status !== 'delivered'
                                    "
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
                                <template v-if="patient.locked">
                                    <button
                                        v-if="patient.status !== 'delivered'"
                                        type="button"
                                        class="btn-outline"
                                        @click="() => deliverReport(patient)"
                                    >
                                        <Loading
                                            size="15"
                                            v-if="deliverReqs.has(patient.id as any)"
                                        />
                                        Archive
                                    </button>
                                    <button
                                        v-else
                                        type="button"
                                        class="btn-outline"
                                        @click="() => unDeliverReport(patient)"
                                    >
                                        <Loading
                                            size="15"
                                            v-if="unDeliverReqs.has(patient.id as any)"
                                        />
                                        Unarchive
                                    </button>
                                </template>
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
        <div class="flex items-center justify-between">
            <CheckBox label="Show archived reports" v-model="showDelivered" />
            <Pagination
                :pages="page.maxPage"
                v-model="page.page"
                class="mt-sm"
            />
        </div>
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
    padding: 20px 30px;

    .h-link-btn {
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
        font-size: var(--fs-md);

        .h-user-role {
            font-weight: normal;
            text-transform: capitalize;
            font-size: var(--fs-base);
        }
    }

    .query-info {
        display: grid;
        grid-template-columns: max-content auto max-content max-content;
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

        .sort-by-selector {
            border: none;
            margin: 0;
            padding: 4px 0;
        }

        .sort-order-button {
            margin: 0;
            padding: 4px 0;
            background: var(--clr-white);
            color: var(--clr-black);

            &:hover {
                color: var(--clr-accent);
            }
        }
    }

    .query-item button {
        padding: 0;
        background: transparent;
        color: var(--clr-black);
    }

    .query-item button:hover {
        color: var(--clr-danger);
    }
    .search-filter {
        position: relative;
    }

    .search-filter svg {
        position: absolute;
        left: 7px;
        top: 50%;
        transform: translateY(-50%);
    }

    .search-filter input {
        width: 100%;
        min-height: 100%;
        border: 1px solid var(--clr-black);
        padding: 5px 8px;
        padding-left: 25px;
    }

    table {
        border-collapse: collapse;

        tr {
            border-bottom: 1px solid var(--clr-black);
        }
        tr:first-child {
            border-bottom-width: 2px;
        }
        th {
            font-size: var(--fs-base);
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
                top: 100%;
                left: 0;
                z-index: 1;
                background: var(--clr-white);

                a {
                    margin-top: 2px;
                }
            }

            &.expanded .dropdown {
                display: block;
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
        // .report-btn {
        //     padding-left: 10px;
        // }

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
}
</style>
