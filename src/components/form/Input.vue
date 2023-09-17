<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, type InputHTMLAttributes, watch } from "vue";

interface InputProps extends InputHTMLAttributes {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    placeholder?: string;
    class?: any;
    icBox?: string | number;
}

const viewBox = ref<string>("0 0 24 24");

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "none",
});

const init = () => {
    if (
        props.icBox &&
        (typeof props.icBox === "number" || props.icBox.indexOf(" ") === -1)
    ) {
        viewBox.value = `0 0 ${props.icBox} ${props.icBox}`;
        console.log(viewBox.value);
    } else if (typeof props.icBox === "string") {
        viewBox.value = props.icBox;
    }
};
init();
watch(props, init);
</script>
<template>
    <div
        :class="[
            'ic-input',
            {
                error: hintType == 'error',
                warning: hintType == 'warning',
                success: hintType == 'success',
            },
            props.class,
        ]"
    >
        <label class="label" v-if="label">{{ label }}</label>
        <div class="relative">
            <div v-if="$slots.default" class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
                    <slot></slot>
                </svg>
            </div>
            <input v-bind="$attrs" :placeholder="placeholder || label" />
        </div>
        <label v-if="hint" class="hint">
            {{ hint }}
        </label>
    </div>
</template>
