<script setup lang="ts">
import router from "@/router";
import PatientForm from "./PatientForm.vue";
const onSuccess = () => {
    router.push({
        name: "home",
    });
};
</script>
<template>
    <PatientForm :on-success="onSuccess" />
</template>
