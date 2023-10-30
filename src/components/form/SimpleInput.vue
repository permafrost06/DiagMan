<script setup lang="ts">
import type { InputHTMLAttributes } from "vue";

interface InputProps extends InputHTMLAttributes {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    class?: any;
    fieldClass?: any;
    unWrap?: boolean;
    type?: InputHTMLAttributes["type"];
    id?: string;
}

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "error",
});
</script>
<template>
    <div v-if="!unWrap" :class="[props.class, 'simple-input']">
        <label :for="id" class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input
                :id="id"
                :type="type || 'text'"
                :class="fieldClass"
                v-bind="$attrs"
            />

            <label
                :for="id"
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
        <label :for="id" class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input
                :id="id"
                :type="type || 'text'"
                :class="fieldClass"
                v-bind="$attrs"
            />

            <label
                :for="id"
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
    padding: 3px 5px;
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
