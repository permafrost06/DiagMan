<script setup lang="ts">
interface InputProps {
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
    <div v-if="!unWrap" :class="[props.class, 'simple-blank-input']">
        <label class="sbi-label" v-if="label">{{ label }}</label>
        <div class="sbi-field-col">
            <slot></slot>

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
        <label class="sbi-label" v-if="label">{{ label }}</label>
        <div class="sbi-field-col">
            <slot></slot>

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
.simple-blank-input {
    display: flex;
    gap: 10px;
}

.sbi-label {
    font-size: var(--fs-base);
}

.sbi-field-col {
    flex-grow: 1;
}

.sbi-field-col .hint {
    font-size: var(--fs-sm);
    margin-top: 2px;
}

.sbi-field-col .hint.error {
    color: var(--clr-danger);
}

.sbi-field-col .hint.success {
    color: var(--clr-success);
}

.sbi-field-col .hint.warning {
    color: var(--clr-warning);
}
</style>
