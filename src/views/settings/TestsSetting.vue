<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { ref } from "vue";

let tOut = 0;
const isLoading = ref<boolean>(false);
const tests = ref<Record<string, string>[]>([]);
const error = ref<string | null>(null);
const query = ref({
    type: "",
    size: "",
    price: "",
});

getTests();

async function getTests() {
    tOut = 0;
    if (isLoading.value) {
        return;
    }
    isLoading.value = true;
    const qs = new URLSearchParams(query.value);
    const res = await fetchApi(API_BASE + `/tests?${qs.toString()}`);
    isLoading.value = false;
    if (!res.success) {
        error.value = res.message || "Something went wrong!";
        return;
    }
    tests.value = res.rows;
}

const loadPage = () => {
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = setTimeout(getTests, 500);
};
</script>
<template>
    <div class="tests-settings">
        <h1 class="page-title fs-2xl">Tests</h1>
        <div class="filter-area flex items-center justify-center">
            <select v-model="query.type" @input="loadPage">
                <option value="">All</option>
                <option value="cyto">Cytopathology</option>
                <option value="histo">Histopathology</option>
            </select>
            <select v-model="query.size" @input="loadPage">
                <option value="">All</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
            </select>
            <div class="flex items-center">
                BDT
                <input
                    type="text"
                    placeholder="Price"
                    v-model="query.price"
                    @input="loadPage"
                />
            </div>
        </div>
        <div class="table-wrapper">
            <table width="100%">
                <tr class="font-h">
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Price</th>
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
                        <td class="flex items-center gap-sm">
                            <div class="skeleton btn"></div>
                            <div class="skeleton btn"></div>
                        </td>
                    </tr>
                </template>
                <tr v-else-if="!tests?.length">
                    <td colspan="5">
                        {{ error || "No test matched your query!" }}
                    </td>
                </tr>
                <template v-else>
                    <tr v-for="test in tests" :key="test.id">
                        <td class="capitalize">{{ test.name }}</td>
                        <td class="capitalize">
                            {{ test.type ? test.type + "pathology" : "N/A" }}
                        </td>
                        <td class="capitalize">{{ test.size || "N/A" }}</td>
                        <td>{{ test.price }}</td>
                        <td>
                            <div class="flex gap-sm row-actions">
                                <button class="btn-outline">Modify</button>
                                <button class="btn-outline">Delete</button>
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
</template>

<style lang="scss">
.tests-settings {
    height: 100%;
    display: flex;
    flex-flow: column;

    .page-title {
        border-bottom: 1px solid var(--clr-black);
    }

    .filter-area {
        margin-top: 30px;
        gap: 20px;

        select,
        input {
            max-width: max-content;
            padding: 2px 5px;
            margin: 0;
            margin-left: 2px;
        }
    }

    .skeleton.btn {
        height: 1.5em;
        width: 100%;
    }

    .table-wrapper {
        flex-grow: 1;
        margin-top: 15px;
        overflow: auto;
    }

    table {
        border-collapse: collapse;
    }
    table tr {
        border-bottom: 1px solid var(--clr-black);
    }
    table tr:first-child {
        border-bottom-width: 2px;
    }
    table th {
        font-size: var(--fs-base);
    }

    table th,
    table td {
        padding: 8px 15px;
        text-align: left;
    }

    .row-actions button {
        padding: 3px 10px;
        font-weight: 600;
    }
}
</style>
