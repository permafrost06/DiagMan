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
    modelValue?: any;
}

const viewBox = ref<string>("0 0 24 24");

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "error",
});
const emit = defineEmits<{
    (e: "update:modelValue", val: any): void;
}>();

const init = () => {
    if (
        props.icBox &&
        (typeof props.icBox === "number" || props.icBox.indexOf(" ") === -1)
    ) {
        viewBox.value = `0 0 ${props.icBox} ${props.icBox}`;
    } else if (typeof props.icBox === "string") {
        viewBox.value = props.icBox;
    }
};
init();
watch(props, init);
</script>
<template>
    <div :class="['ic-input', props.hintType, props.class]">
        <label class="label" v-if="label">{{ label }}</label>
        <div class="relative">
            <div v-if="$slots.default" class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
                    <slot></slot>
                </svg>
            </div>
            <input
                v-bind="$attrs"
                :value="modelValue"
                :placeholder="placeholder || label"
                @input="(evt: any) => emit('update:modelValue', evt.target?.value)"
            />
        </div>
        <label v-if="hint" class="hint">
            {{ hint }}
        </label>
    </div>
</template>

<style lang="scss">
.ic-input {
    color: var(--clr-black);
}

.ic-input .label,
.label {
    margin-bottom: 5px;
    font-weight: normal;
    font-size: var(--fs-sm);
    color: var(--clr-black);
}

.ic-input .hint {
    font-size: var(--fs-sm);
    font-weight: normal;
    line-height: 1.5;
    margin-top: 0;
}

.ic-input.error .hint {
    color: red;
}

.ic-input.success .hint {
    color: green;
}
.ic-input.warning .hint {
    color: yellow;
}

.ic-input .input-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    padding-left: 12px;
    pointer-events: none;
}
.ic-input .input-icon svg {
    height: 20px;
    width: 20px;
    color: inherit;
}
.ic-input input {
    box-sizing: border-box;
    display: block;
    width: 100%;
    background-color: var(--clr-white);
    border: 1px solid var(--clr-black);
    font-size: var(--fs-sm);
    border-radius: 0;
    padding: 10px 15px;
}

.ic-input input:focus {
    --focus-border: 1px solid var(--clr-accent);
    border: var(--focus-border);
    /* box-shadow: 0 0 3px var(--clr-accent); */
    outline: var(--focus-border);
}

.ic-input .input-icon + input {
    padding-left: 40px;
}
</style>
