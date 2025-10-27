<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, type SelectHTMLAttributes, watch } from "vue";

interface InputProps extends /* @vue-ignore */ SelectHTMLAttributes {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
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
    <div :class="['ic-select', props.hintType, props.class]">
        <label class="label" v-if="label">{{ label }}</label>
        <div class="relative">
            <div v-if="$slots.icon" class="select-icon">
                <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
                    <slot name="icon"></slot>
                </svg>
            </div>
            <select
                v-bind="$attrs"
                :value="modelValue"
                @input="(evt: any) => emit('update:modelValue', evt.target?.value)"
            >
                <slot></slot>
            </select>
        </div>
        <label v-if="hint" class="hint">
            {{ hint }}
        </label>
    </div>
</template>

<style lang="scss">
.ic-select {
    color: var(--clr-black);

    .label {
        margin-bottom: 5px;
        font-weight: normal;
        font-size: var(--fs-sm);
        color: var(--clr-black);
    }

    .hint {
        font-size: var(--fs-sm);
        font-weight: normal;
        line-height: 1.5;
        margin-top: 0;
    }

    &.error .hint {
        color: red;
    }

    &.success .hint {
        color: green;
    }
    &.warning .hint {
        color: yellow;
    }

    .select-icon {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        padding-left: 12px;
        pointer-events: none;
    }
    .select-icon svg {
        height: 20px;
        width: 20px;
        color: inherit;
    }
    select {
        box-sizing: border-box;
        display: block;
        width: 100%;
        background-color: var(--clr-white);
        border: 1px solid var(--clr-black);
        font-size: var(--fs-sm);
        border-radius: 0;
        padding: 10px 15px;
    }

    select:focus {
        --focus-border: 1px solid var(--clr-accent);
        border: var(--focus-border);
        /* box-shadow: 0 0 3px var(--clr-accent); */
        outline: var(--focus-border);
    }

    .select-icon + select {
        padding-left: 40px;
    }
}
</style>
