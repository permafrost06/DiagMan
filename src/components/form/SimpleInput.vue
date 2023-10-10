<script setup lang="ts">
import type { InputHTMLAttributes } from "vue";

interface InputProps extends InputHTMLAttributes {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    class?: any;
    unWrap?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "error",
});
</script>
<template>
    <div v-if="!unWrap" :class="[props.class, 'simple-input']">
        <label class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input v-bind="$attrs" />

            <label
                v-if="hint"
                :class="{
                    hint: true,
                    error: hintType == 'error',
                    warning: hintType == 'warning',
                    success: hintType == 'success',
                }"
            >
                {{ hint }}
            </label>
        </div>
    </div>
    <template v-else>
        <label class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input v-bind="$attrs" />

            <label
                v-if="hint"
                :class="{
                    hint: true,
                    error: hintType == 'error',
                    warning: hintType == 'warning',
                    success: hintType == 'success',
                }"
            >
                {{ hint }}
            </label>
        </div>
    </template>
</template>

<style lang="scss">
.simple-input {
    display: flex;
    gap: 10px;
}

.si-label {
    font-size: var(--fs-base);
}

.si-field-col {
    flex-grow: 1;
}

.si-field-col input {
    display: block;
    width: 100%;
}

.si-field-col .hint {
    font-size: var(--fs-sm);
    margin-top: 2px;
}

.si-field-col .hint.error {
    color: var(--clr-danger);
}

.si-field-col .hint.success {
    color: var(--clr-success);
}

.si-field-col .hint.warning {
    color: var(--clr-warning);
}
</style>
