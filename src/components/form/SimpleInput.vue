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
    hintType: "none",
});
</script>
<template>
    <div v-if="!unWrap" :class="[props.class, 'simple-input']">
        <label class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input v-bind="$attrs" />

            <label v-if="hint" class="hint">
                {{ hint }}
            </label>
        </div>
    </div>
    <template v-else>
        <label class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input v-bind="$attrs" />

            <label v-if="hint" class="hint">
                {{ hint }}
            </label>
        </div>
    </template>
</template>
