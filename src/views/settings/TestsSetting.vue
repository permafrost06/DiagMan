<script setup lang="ts">
import TestFormModal from "@/components/view/TestFormModal.vue";
import ConfirmModal from "@/components/modal/ConfirmModal.vue";
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { ref } from "vue";

let tOut = 0;
const formValue = ref<boolean | Record<string, string>>(false);
const deleteValue = ref();
const isLoading = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
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

const onAdded = (test: any) => {
    if (typeof formValue.value !== "object") {
        tests.value.unshift(test);
        return;
    }
    // @ts-ignore
    const filtered = tests.value.filter((t) => t.id != formValue.value.id);
    filtered.unshift(test);
    tests.value = filtered;
    formValue.value = false;
};

async function deleteTest() {
    if (!deleteValue.value || isDeleting.value) {
        return;
    }
    isDeleting.value = true;
    const res = await fetchApi(`${API_BASE}/tests/${deleteValue.value.id}`, {
        method: "DELETE",
        body: JSON.stringify({
            id: deleteValue.value?.id,
        }),
    });
    isDeleting.value = false;
    if (res.success) {
        error.value = null;
        tests.value = tests.value.filter(
            (test) => test.id != deleteValue.value?.id
        );
        deleteValue.value = null;
    } else {
        error.value = res.message;
    }
}
</script>
<template>
    <div class="tests-settings">
        <h1 class="page-title fs-2xl">Tests</h1>
        <div class="flex items-center gap-sm">
            <button class="add-btn" @click="formValue = true">
                + Add Test
            </button>
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
                                <button
                                    class="btn-outline"
                                    @click="formValue = test"
                                >
                                    Modify
                                </button>
                                <button
                                    class="btn-outline"
                                    @click="deleteValue = test"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
    <TestFormModal
        v-if="formValue"
        :onClose="() => (formValue = false)"
        :onAdded="onAdded"
        :edit="typeof formValue === 'object' ? formValue : undefined"
    />

    <ConfirmModal title="Are you sure?" icon="delete" v-if="deleteValue">
        <p v-if="error" class="form-alert error">{{ error }}</p>
        <p>
            Are you sure to delete the test named
            <span class="bold"> {{ deleteValue.name }} </span>?
        </p>
        <p class="danger fs-md bold">It cannot be undone!</p>
        <template v-slot:buttons>
            <button @click="deleteTest">
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
.tests-settings {
    height: 100%;
    display: flex;
    flex-flow: column;

    .page-title {
        border-bottom: 1px solid var(--clr-black);
        margin-bottom: 30px;
    }

    .add-btn {
        padding: 5px 15px;
        font-weight: bold;
    }

    .filter-area {
        gap: 20px;
        flex-grow: 1;

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
