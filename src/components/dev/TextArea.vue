<script setup lang="ts">
defineProps<{
    modelValue: string;
}>();
const emit = defineEmits<{
    (e: "update:modelValue", page: number): void;
}>();
const updated = (evt: any) => {
    emit("update:modelValue", evt.target.value);
};
</script>
<template>
    <textarea :value="modelValue" @input="updated"></textarea>
</template>
<style scoped>
textarea {
    display: block;
    min-height: 80px;
    width: 100%;
    border-radius: 5px;
    border: 1px solid #a7a7a7;
    padding: 5px;
}
</style>
