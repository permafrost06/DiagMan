<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { addRequest, fetchApi, type ApiResponse } from "@/helpers/http";
import { onMounted, ref, watch } from "vue";
import { testSchema } from "@worker/forms/test";
import { validateObject } from "@/helpers/utils";
import { hasDuplicate } from "@/helpers/utils";
import { getTests } from "@/helpers/offline";

const isPosting = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);
const toEdit = ref<Record<string, number | string> | null>(null);
const toDelete = ref<Record<string, number | string> | null>(null);
const status = ref<"active" | "updated" | "deleted" | null>("active");

onMounted(() => {
    loadTests();
});

watch(status, () => {
    loadTests();
});

async function loadTests() {
    isLoading.value = true;
    const res = await fetchApi(`${API_BASE}/tests?status=${status.value}`);
    isLoading.value = false;
    if (!res.success) {
        error.value = res.message;
        return;
    }
    tests.value = [...res.rows, ...getTests(status.value)];
}

async function handleFormSubmit(evt: any) {
    isPosting.value = true;
    const res = await addRequest(
        "tests",
        (all, now) => {
            const data = validateObject(now, testSchema);
            if (!data.success) {
                return data as ApiResponse;
            }
            return hasDuplicate(all, (data as any).data);
        },
        evt.target.action,
        {
            method: "POST",
            body: new FormData(evt.target),
        }
    );

    isPosting.value = false;
    if (res.success) {
        error.value = null;
        message.value = res.message!;
        tests.value.push(res.rows[0]);
        if (res.data?.updated) {
            tests.value = tests.value.filter(
                (test) => test.id != res.data.updated
            );
            toEdit.value = null;
        }
    } else {
        error.value = res.message;
    }
}

async function deleteTest(toDel: any) {
    const del = confirm("Are you sure?");
    if (!del) {
        return;
    }
    toDelete.value = toDel;
    const res = await fetchApi(`${API_BASE}/tests/${toDel.id}`, {
        method: "DELETE",
    });
    if (res.success) {
        error.value = null;
        message.value = res.message!;
        if (res.data?.deleted > 0) {
            tests.value = tests.value.filter(
                (test) => test.id != toDelete.value?.id
            );
        }
    } else {
        error.value = res.message;
    }
    toDelete.value = null;
}
</script>
<template>
    <div class="row-wrap">
        <form
            :action="`${API_BASE}/tests`"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <input type="hidden" name="status" value="active" />
            <input v-if="toEdit" type="hidden" name="id" :value="toEdit.id" />
            <p v-if="error">Error: {{ error }}</p>
            <p v-if="message">{{ message }}</p>
            <div>
                <label for="price">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    :value="toEdit?.name"
                />
            </div>
            <div>
                <label for="price">Price</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    :value="toEdit?.price"
                />
            </div>
            <div>
                <label for="size">Size</label>
                <select name="size" id="size" :value="toEdit?.size">
                    <option value="">Select Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="complex">Complex</option>
                </select>
            </div>
            <button :disabled="isPosting" type="submit">
                <span v-if="isPosting">Please wait...</span>
                <span v-else-if="toEdit">Update</span>
                <span v-else>Add</span>
            </button>
        </form>
        <div>
            <div class="table-title">
                <h3>Tests</h3>
                <select v-model="status">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th></th>
                </tr>
                <tr v-if="isLoading">
                    <td colspan="6">Loading tests...</td>
                </tr>
                <tr v-else-if="tests.length === 0">
                    <td colspan="6">No tests added yet!</td>
                </tr>
                <template v-else>
                    <tr v-for="test in tests" :key="test.id">
                        <td>{{ test.id }}</td>
                        <td>{{ test.name }}</td>
                        <td>{{ test.price }}</td>
                        <td>{{ test.size }}</td>
                        <td>{{ test.status }}</td>
                        <td>
                            <button @click="toEdit = test">Edit</button>
                            <button @click="deleteTest(test)">
                                {{
                                    toDelete?.id === test.id
                                        ? "Wait..."
                                        : "Delete"
                                }}
                            </button>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
</template>

<style>
th,
td {
    padding: 5px 8px;
    margin: 0;
}
form {
    width: 50%;
    margin: 0 50px;
}
.table-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.table-title select {
    width: max-content;
    background: transparent;
    border: none;
    height: auto;
    margin: 0;
    cursor: pointer;
}
</style>
