<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import router from "@/router";
import { onMounted, ref } from "vue";

const patient = ref<Record<string, any>>();
const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);

onMounted(() => {
    const data = localStorage.getItem("to_report");
    if (!data) {
        router.back();
        return;
    }
    localStorage.removeItem("to_report");
    patient.value = JSON.parse(data);
});

const handleFormSubmit = async (evt: any) => {
    isLoading.value = true;
    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });

    isLoading.value = false;
    if (res.success) {
        error.value = null;
        message.value = res.message!;
    } else {
        error.value = res.message;
    }
};
</script>
<template>
    <div class="box">
        <ul v-if="patient">
            <li>Name: {{ patient.name }}</li>
            <li>Age: {{ patient.age }}</li>
            <li>Gender: {{ patient.gender }}</li>
            <li>Contact: {{ patient.contact }}</li>
            <li>Type: {{ patient.type }}</li>
        </ul>
    </div>
    <div class="box">
        <form
            v-if="patient"
            :action="API_BASE + '/reports'"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <p v-if="error">Error: {{ error }}</p>
            <p v-if="message">{{ message }}</p>

            <input type="hidden" name="id" :value="patient.id" />
            <div>
                <label for="aspiration_note">Aspiration Note</label>
                <textarea
                    name="aspiration_note"
                    id="aspiration_note"
                    rows="5"
                ></textarea>
            </div>
            <div v-if="patient.type === 'cyto'">
                <label for="gross_examination">Gross Examination</label>
                <textarea
                    name="gross_examination"
                    id="gross_examination"
                    rows="5"
                ></textarea>
            </div>
            <div v-else>
                <label for="microscopic_examination"
                    >Microscopic Examination</label
                >
                <textarea
                    name="microscopic_examination"
                    id="microscopic_examination"
                    rows="5"
                ></textarea>
            </div>
            <div>
                <label for="impression">Impression</label>
                <textarea name="impression" id="impression" rows="5"></textarea>
            </div>

            <div>
                <label for="note">Note</label>
                <textarea name="note" id="note" rows="5"></textarea>
            </div>
            <button :disabled="isLoading" type="submit">
                {{ isLoading ? "Please wait..." : "Submit" }}
            </button>
        </form>
    </div>
</template>
<style>
form {
    display: block;
    padding: 10px 0;
    margin: 0 20px;
}
.box {
    padding: 10px;
    margin: 10px;
    border: 1px solid #a7a7a7;
    border-radius: 10px;
}
</style>
