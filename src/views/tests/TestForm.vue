<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);

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
        tests.value.push(res.data);
    } else {
        error.value = res.message;
    }
}
</script>
<template>
    <div class="row-wrap">
        <form
            :action="`${API_BASE}/tests`"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <p v-if="error">Error: {{ error }}</p>
            <p v-if="message">{{ message }}</p>
            <div>
                <label for="price">Name</label>
                <input type="text" id="name" name="name" />
            </div>
            <div>
                <label for="price">Price</label>
                <input type="number" id="price" name="price" />
            </div>
            <div>
                <label for="size">Size</label>
                <select name="size" id="size">
                    <option value="">Select Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="complex">Complex</option>
                </select>
            </div>
            <button :disabled="isLoading" type="submit">
                {{ isLoading ? "Please wait..." : "Submit" }}
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
