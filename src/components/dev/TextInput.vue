<script setup lang="ts">
import type { InputHTMLAttributes } from "vue";

interface TextInputProps extends InputHTMLAttributes {
    modelValue?: string | number;
}

defineProps<TextInputProps>();
const emit = defineEmits<{
    (e: "update:modelValue", page: number): void;
}>();
const updated = (evt: any) => {
    emit("update:modelValue", evt.target.value);
};
</script>
<template>
    <input :value="modelValue" @input="updated" />
</template>
<style scoped>
input {
    display: block;
    width: 100%;
    border-radius: 5px;
    border: 1px solid #a7a7a7;
    padding: 5px;
    box-sizing: border-box;
}
</style>
