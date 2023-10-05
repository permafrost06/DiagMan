<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import Pagination from "@/components/Pagination.vue";
import Icon from "@/components/base/Icon.vue";
import SearchFilter from "@/components/SearchFilter.vue";
import ThActionable from "@/components/base/ThActionable.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import {
    TABLES,
    getRowCount,
    getRows,
    insertRowBulk,
} from "@/helpers/local-db";
import type { Sorting } from "@/helpers/utils";
import router from "@/router";
import { useUser } from "@/stores/user";
import { onMounted, ref, watch } from "vue";

const user = useUser();
const isLoading = ref(false);
const error = ref<string | null>(null);
const patients = ref<Array<Record<string, number | string>>>([]);
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
    delivery_date: "Delivery Date",
    status: "Status",
};

const sortBy = (newSortState: Sorting<string>) => {
    sortState.value = newSortState;
};
const showFilter = (col: string) => {
    filterRef.value.setCursor(col);
};

const filterChange = (val: Record<string, string>) => {
    queryParams = val;
    page.value.page = 1;
    queryResults();
};

const report = (patient: any) => {
    localStorage.setItem("to_report", JSON.stringify(patient));
    router.push({
        name: "reports",
    });
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
</script>
<template>
    <div class="patients-page">
        <div class="patients-header">
            <div class="flex items-center">
                <h3 class="font-h">Patient List</h3>
                <button class="h-main-btn font-h">+ Add Patient</button>
            </div>
            <div class="flex items-center">
                <p class="h-user-name font-h">{{ user.name }}</p>
                <button class="h-icon-btn">
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
                </button>
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
                <tr v-if="isLoading">
                    <td colspan="6">Loading, please wait...</td>
                </tr>
                <tr v-else-if="!patients?.length">
                    <td colspan="6">{{ error || "No patients added yet!" }}</td>
                </tr>
                <template v-else>
                    <tr v-for="patient in patients" :key="patient.id">
                        <td>{{ patient.id }}</td>
                        <td>{{ patient.name }}</td>
                        <td class="capitalize">{{ patient.type }}pathology</td>
                        <td>{{ patient.delivery_date }}</td>
                        <td class="flex capitalize items-center">
                            {{ patient.status }}
                        </td>
                        <td>
                            <div class="flex gap-sm row-actions">
                                <button>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                                        />
                                    </svg>
                                    Report
                                </button>
                                <button class="btn-outline">Edit</button>
                                <button class="btn-outline">Delete</button>
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
        <Pagination :pages="page.maxPage" v-model="page.page" class="mt-sm" />
    </div>
</template>
