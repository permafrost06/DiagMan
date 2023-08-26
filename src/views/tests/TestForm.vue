<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { onMounted, ref } from "vue";

const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);

onMounted(async () => {
    const res = await fetch(`${API_BASE}/tests`);
    const data = await res.json();
    if (!data.success) {
        error.value = data.message || "Something went wrong while fetching...";
        return;
    }
    tests.value = data.body.rows;
});

async function handleFormSubmit(evt: any) {
    isLoading.value = true;
    const res = await fetch(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });

    const data = await res.json();
    isLoading.value = false;
    if (data.success) {
        error.value = null;
        message.value = data.message;
        tests.value.push(data.body.data);
    } else {
        message.value = null;
        if (data.message) {
            error.value = data.message;
        } else {
            for (let name in data.body.fields) {
                error.value = `[${name}] ` + data.body.fields[name][0];
                break;
            }
        }
    }
}
</script>
<template>
    <div class="row">
        <form
            :action="`${API_BASE}/tests/add`"
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
