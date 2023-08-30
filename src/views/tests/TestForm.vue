<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);
const toEdit = ref<Record<string, number | string> | null>(null);
const toDelete = ref<Record<string, number | string> | null>(null);

onMounted(async () => {
    const res = await fetchApi(`${API_BASE}/tests`);
    if (!res.success) {
        error.value = res.message;
        return;
    }
    tests.value = res.rows;
});

async function handleFormSubmit(evt: any) {
    isLoading.value = true;
    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });

    isLoading.value = false;
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
            <button :disabled="isLoading" type="submit">
                <span v-if="isLoading">Please wait...</span>
                <span v-else-if="toEdit">Update</span>
                <span v-else>Add</span>
            </button>
        </form>
        <div>
            <h3>Tests</h3>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th></th>
                </tr>
                <tr v-if="tests.length === 0">
                    <td colspan="4">No tests added yet!</td>
                </tr>
                <template v-else>
                    <tr v-for="test in tests" :key="test.id">
                        <td>{{ test.id }}</td>
                        <td>{{ test.name }}</td>
                        <td>{{ test.price }}</td>
                        <td>{{ test.size }}</td>
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
form {
    width: 50%;
    margin: 0 50px;
}
</style>
