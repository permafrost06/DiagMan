<script setup lang="ts">
import { useRoute } from "vue-router";
import PatientForm from "./PatientForm.vue";
import { ref } from "vue";
import { fetchApi } from "@/helpers/http";
import { API_BASE } from "@/helpers/config";
import Loading from "@/Icons/Loading.vue";
import Icon from "@/components/base/Icon.vue";
import router from "@/router";

defineProps<{
    headless?: boolean;
    onSuccess?: (
        row: Record<string, string>,
        message: string,
        invoice: boolean
    ) => void;
}>();

const route = useRoute();
const isLoading = ref(true);
const error = ref("");
const patient = ref(null);

async function loadPatient() {
    const res = await fetchApi(
        API_BASE + `/patients/${encodeURIComponent(route.params.id as string)}`
    );
    if (!res.success) {
        error.value = res.message;
    } else {
        patient.value = res.rows[0];
    }
    isLoading.value = false;
}
loadPatient();

const onLocalSuccess = (_a: any, _b: any, invoice: boolean) => {
    if (invoice) {
        return;
    }
    router.back();
};
</script>
<template>
    <PatientForm
        :to-edit="patient"
        v-if="patient"
        :headless="headless"
        :on-success="onSuccess || onLocalSuccess"
    />
    <div v-else class="add-patient-page">
        <div v-if="!headless">
            <h1 class="fs-2xl">Update Patient</h1>
            <RouterLink :to="{ name: 'home' }" class="home-url">
                <Icon size="40" view-box="36">
                    <path
                        fill="currentColor"
                        d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                        class="clr-i-outline clr-i-outline-path-1"
                    /><path fill="none" d="M0 0h36v36H0z" />
                </Icon>
            </RouterLink>
        </div>
        <div class="ap-body">
            <Loading v-if="isLoading" size="60" />
            <p v-else class="form-alert error">
                {{ error || "Something went wrong!" }}
            </p>
        </div>
    </div>
</template>
<style lang="scss">
.add-patient-page {
    padding: 30px;
    height: 100%;
    display: flex;
    flex-flow: column;
    .ap-body {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
