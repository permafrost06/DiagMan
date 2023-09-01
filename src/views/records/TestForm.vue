<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);
const patientTests = ref<Array<Record<string, number | string>>>([]);

onMounted(async () => {
    fetchApi(`${API_BASE}/tests`).then((res) => {
        if (!res.success) {
            error.value = res.message;
            return;
        }
        tests.value = res.rows;
    });
    fetchApi(`${API_BASE}/patients`).then((res) => {
        if (!res.success) {
            error.value = res.message;
            return;
        }
        patientTests.value = res.rows;
    });
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
        patientTests.value.push(res.data);
    } else {
        error.value = res.message;
    }
}
</script>
<template>
    <div class="row-wrap">
        <form
            :action="`${API_BASE}/patients`"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <p v-if="error">Error: {{ error }}</p>
            <p v-if="message">{{ message }}</p>

            <div class="input-group flex">
                <div>
                    <label for="type">Type</label>
                    <select name="type" id="type">
                        <option value="">Select Type</option>
                        <option value="histo">Histo</option>
                        <option value="cyto">Cyto</option>
                    </select>
                </div>

                <div>
                    <label for="status">Status</label>
                    <select name="status" id="status">
                        <option value="">Select Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="locked">Locked</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
            </div>

            <div class="input-group">
                <div>
                    <label for="name">Patient Name</label>
                    <input type="text" id="name" name="name" />
                </div>
                <div>
                    <label for="age"> Age </label>
                    <input type="number" id="age" name="age" />
                </div>

                <div>
                    <label for="gender">Gender</label>
                    <select name="gender" id="gender">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div>
                    <label for="contact"> Contact no </label>
                    <input type="text" id="contact" name="contact" />
                </div>
            </div>

            <div class="input-group">
                <div>
                    <label for="specimen"> Specimen </label>
                    <input type="text" id="specimen" name="specimen" />
                </div>

                <div>
                    <label for="referer"> Referer </label>
                    <input type="text" id="referer" name="referer" />
                </div>
            </div>

            <div class="input-group">
                <div>
                    <label for="sample_collection_date">
                        Sample Collection Date
                    </label>
                    <input
                        type="date"
                        id="sample_collection_date"
                        name="sample_collection_date"
                    />
                </div>

                <div>
                    <label for="entry_date"> Entry Date </label>
                    <input type="date" id="entry_date" name="entry_date" />
                </div>

                <div>
                    <label for="delivery_date"> Delivery Date </label>
                    <input
                        type="date"
                        id="delivery_date"
                        name="delivery_date"
                    />
                </div>
            </div>

            <div class="input-group">
                <div>
                    <label>Tests</label>
                    <div class="input">
                        <label v-for="(test, i) in tests" :key="i">
                            <input
                                type="checkbox"
                                name="tests"
                                :value="test.id"
                            />
                            <span>{{ test.name }}</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label for="discount">Discount</label>
                    <input type="number" id="discount" name="discount" />
                </div>
                <div>
                    <label for="advance">Advance</label>
                    <input type="number" id="advance" name="advance" />
                </div>
                <div>
                    <label for="due">Due</label>
                    <input type="number" id="due" name="due" />
                </div>
            </div>

            <button :disabled="isLoading" type="submit">
                {{ isLoading ? "Please wait..." : "Submit" }}
            </button>
        </form>
        <div>
            <h3>Patients</h3>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Patient Name</th>
                    <th>Entry</th>
                    <th>Collection</th>
                    <th>Contact</th>
                    <th>Tests</th>
                </tr>
                <tr v-if="patientTests.length === 0">
                    <td colspan="4">No tests added yet!</td>
                </tr>
                <template v-else>
                    <tr v-for="test in patientTests" :key="test.id">
                        <td>{{ test.id }}</td>
                        <td>{{ test.type }}</td>
                        <td>{{ test.status }}</td>
                        <td>{{ test.name }}</td>
                        <td>{{ test.entry_date }}</td>
                        <td>{{ test.sample_collection_date }}</td>
                        <td>{{ test.contact }}</td>
                        <td>{{ test.tests }}</td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
</template>
<style>
form {
    width: 100%;
    max-width: 500px;
    margin: 0 50px;
}
th,
td {
    margin: 0;
    padding: 5px;
}
.input {
    background: white;
    border: 1px solid #a7a7a7;
    border-radius: 5px;
    padding: 5px;
    margin-bottom: 10px;
}
.input-group {
    border-radius: 8px;
    border: 1px solid #a7a7a7;
    padding: 10px;
    margin: 10px 0;
}

.flex {
    display: flex;
    justify-content: space-between;
}
</style>
