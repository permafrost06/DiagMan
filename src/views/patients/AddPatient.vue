<script setup lang="ts">
import router from "@/router";
import PatientForm from "./PatientForm.vue";
const onSuccess = (_x: any, _y: any, invoice: boolean) => {
    if (invoice) {
        return;
    }
    router.push({
        name: "home",
    });
};
</script>
<template>
    <PatientForm :on-success="onSuccess" />
</template>
