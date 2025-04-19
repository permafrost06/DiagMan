<script setup lang="ts">
import Pagination from "@/components/Pagination.vue";
import Icon from "@/components/base/Icon.vue";
import ConfirmModal from "@/components/modal/ConfirmModal.vue";
import { API_BASE, saveListConfig } from "@/helpers/config";
import { ApiResponsePaged, fetchApi } from "@/helpers/http";
import {
    TABLES,
    getRowCount,
    getRows,
    insertRowBulk,
} from "@/helpers/local-db";
import { useSorter } from "@/helpers/utils";
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import Loading from "@/Icons/Loading.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import { useRoute, useRouter } from "vue-router";
import HeaderMain from "@/components/view/HeaderMain.vue";
import FullPageLoader from "@/components/base/FullPageLoader.vue";
import { useUser } from "@/stores/user";
import ListTable from "./components/ListTable.vue";

const router = useRouter();
const route = useRoute();
const user = useUser();

const isLoading = ref<boolean>(false);
const isLoadingConfig = ref<boolean>(true);
const config = ref({
    limit: 0,
    show: [
        "name",
        "contact",
        "timestamp",
        "specimen",
        "delivery_date",
        "actions",
    ],
    sizes: {},
});
const limit = ref(0);
const deleteValue = ref();
const isDeleting = ref<boolean>(false);
const error = ref<string | null>(null);
const patients = ref<Array<Record<string, string>>>([]);
const showDelivered = ref<boolean>(
    typeof route.query.delivered !== "undefined",
);
const paginationInfo = ref<ApiResponsePaged["pagination"]>({
    total: 0,
    page: 1,
    maxPage: 1,
});
const [sortState, doSorting] = useSorter<string>(
    (route.query.sort_by as any) || "timestamp",
    (route.query.order as any) || "desc",
);

const paginationWrapper = ref<HTMLDivElement | null>(null);
let search = ref((route.query.search as string)?.trim() || "");
let filterType = ref((route.query.type as string)?.trim());

const tableDescription = {
    name: {
        label: "Name",
        sort: true,
    },
    contact: {
        label: "Contact No",
        sort: true,
    },
    timestamp: {
        label: "Date Added",
        sort: true,
    },
    type: {
        label: "Type",
        sort: true,
    },
    age: {
        label: "Age",
        sort: true,
    },
    gender: {
        label: "Gender",
        sort: true,
    },
    delivery_date: {
        label: "Delivery Date",
        sort: true,
    },
    specimen: {
        label: "Specimen",
        sort: true,
    },
    status: {
        label: "Status",
        sort: true,
    },
    referer: {
        label: "Referer",
        sort: true,
    },
    actions: {
        label: "",
        sort: false,
    },
};

const sortBy = (sortByCol: string) => {
    doSorting(sortByCol);
    router.push({
        query: {
            ...route.query,
            sort_by: sortByCol,
            order: sortState.value.order,
            page: undefined,
        },
    });
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

const calculateLimit = () => {
    const el = paginationWrapper.value;
    if (limit.value > 0 || !el) {
        queryResults();
        return;
    }
    const rowHeight = config.value.show.includes("name") ? 57 : 42;
    const BOTTOM_ELEMENT_HEIGHT = 45;
    const remHeight =
        window.innerHeight -
        el.getBoundingClientRect().top -
        BOTTOM_ELEMENT_HEIGHT;
    const rows = Math.floor(remHeight / rowHeight);
    limit.value = rows;
    queryResults();
};

onMounted(() => {
    fetchApi(`${API_BASE}/misc/?name=patient_list_config_${user.id}`).then(
        (res) => {
            if (res.success && res.rows.length) {
                config.value = JSON.parse(res.rows[0].data);
                config.value.show.push("actions");
                config.value.sizes ||= {};
            }
            isLoadingConfig.value = false;
            limit.value = config.value.limit;
            nextTick(calculateLimit);
        },
    );
    document.addEventListener("click", printBtnEvt);
});
onUnmounted(() => {
    document.removeEventListener("click", printBtnEvt);
});
watch(() => route.query, queryResults);
watch(
    () => showDelivered.value,
    () => {
        router.push({
            query: {
                ...route.query,
                delivered: showDelivered.value ? "1" : undefined,
                page: undefined,
            },
        });
    },
);

let searchTout: any = null;
watch(search, (search) => {
    if (searchTout) {
        clearTimeout(searchTout);
    }
    const q = search.trim();
    if (!q) {
        router.push({
            query: {
                ...route.query,
                search: undefined,
                page: undefined,
            },
        });
        return;
    }
    searchTout = setTimeout(() => {
        router.push({
            query: {
                ...route.query,
                search: q,
                page: undefined,
            },
        });
    }, 500);
});

async function queryResults() {
    if (!navigator.onLine) {
        patients.value = getRows(TABLES.patients);
        return;
    }

    isLoading.value = true;
    const queryParams: Record<string, string> = {
        ...(search.value ? { search: search.value } : {}),
        ...(filterType.value ? { type: filterType.value } : {}),
    };
    queryParams.page = (route.query.page as string) || "1";
    queryParams.limit = limit.value.toString();
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
        paginationInfo.value = res.pagination!;
    }
}

const filterResult = (by: string, value: string) => {
    value = value.trim();
    if (!value) {
        router.push({
            query: {
                ...route.query,
                [by]: undefined,
                page: undefined,
            },
        });
    } else {
        router.push({
            query: {
                ...route.query,
                [by]: value,
                page: undefined,
            },
        });
    }
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
        },
    );
    isDeleting.value = false;
    if (res.success) {
        error.value = null;
        patients.value = patients.value.filter(
            (p) => p.id != deleteValue.value?.id,
        );
        deleteValue.value = null;
    } else {
        error.value = res.message;
    }
}

let tOut: any = null;

const onConfigChange = (newConfig: any) => {
    config.value = newConfig;
    const show = config.value.show.filter((col: string) => col !== "actions");
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = setTimeout(() => {
        saveListConfig({
            ...config.value,
            show,
        });
    }, 1000);
};
</script>
<template>
    <FullPageLoader v-if="isLoadingConfig" />
    <div v-else class="patients-page">
        <HeaderMain title="Patients List" />
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
                    v-model="search"
                />
            </div>
            <div class="query-item">
                <p>Filter:</p>
                <select
                    class="sort-by-selector"
                    @input="
                        (evt: any) => filterResult('type', evt.target.value)
                    "
                    :value="filterType"
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
                    <template v-for="col in config.show" :key="col">
                        <option
                            :value="col"
                            v-if="
                                (tableDescription as any)[col]?.sort !== false
                            "
                        >
                            {{ (tableDescription as any)[col].label }}
                        </option>
                    </template>
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
        <ListTable
            :is-loading="isLoading"
            :patients="patients"
            :limit="limit"
            :table-description="tableDescription"
            :sort-by="sortBy"
            :sort-state="sortState"
            :config="config"
            :on-delete="(patient) => (deleteValue = patient)"
            :search="search"
            @config="onConfigChange"
        />
        <div class="flex items-center justify-between" ref="paginationWrapper">
            <CheckBox label="Show archived reports" v-model="showDelivered" />
            <Pagination
                class="mt-sm"
                :max-page="paginationInfo!.maxPage"
                :per-page="10"
                :item-count="paginationInfo!.total"
                :on-each-side="0"
                :shown-items="patients.length"
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
}
</style>
