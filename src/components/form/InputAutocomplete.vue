<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { fetchApi } from "@/helpers/http";
import { ref, watch } from "vue";

interface InputProps {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    placeholder?: string;
    class?: any;
    icBox?: string | number;
    url: (val: string) => string;
    modelValue?: string;
}

const viewBox = ref<string>("0 0 24 24");
const results = ref<Record<string, any>[]>([]);
const inputRef = ref<HTMLInputElement>();

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "error",
});
const emit = defineEmits<{
    (e: "update:modelValue", val: string): void;
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

let tOut: any = 0,
    ctrl = new AbortController(),
    fetchVal: string = "";

const fetchResults = async () => {
    const res = await fetchApi(props.url(fetchVal), {
        signal: ctrl.signal,
    });
    if (!res.success) {
        console.error(
            res.message || "Request failed with error code: " + res.status
        );
        return;
    }
    results.value = res.rows;
};

const handleInput = (evt: any) => {
    if (tOut) {
        clearTimeout(tOut);
        ctrl.abort();
        ctrl = new AbortController();
    }
    fetchVal = evt.target.value;
    emit("update:modelValue", fetchVal);
    tOut = setTimeout(fetchResults, 500);
};

function handleClick(val: string) {
    emit("update:modelValue", val);
    // @ts-ignore
    inputRef.value.value = val;
}
</script>
<template>
    <div :class="['auto-complete-input', props.hintType, props.class]">
        <label class="label" v-if="label">{{ label }}</label>
        <div class="relative">
            <div v-if="$slots.icon" class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
                    <slot name="icon"></slot>
                </svg>
            </div>
            <input
                ref="inputRef"
                type="text"
                autocomplete="off"
                v-bind="$attrs"
                :placeholder="placeholder || label"
                @input="handleInput"
            />
            <div class="result-area">
                <slot :accept="handleClick" :results="results"></slot>
            </div>
        </div>
        <label v-if="hint" class="hint">
            {{ hint }}
        </label>
    </div>
</template>

<style lang="scss">
.auto-complete-input {
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

    .input-icon {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        padding-left: 12px;
        pointer-events: none;
    }
    .input-icon svg {
        height: 20px;
        width: 20px;
        color: inherit;
    }
    input {
        box-sizing: border-box;
        display: block;
        width: 100%;
        background-color: var(--clr-white);
        border: 1px solid var(--clr-black);
        font-size: var(--fs-sm);
        border-radius: 0;
        padding: 10px 15px;
    }

    input:focus {
        --focus-border: 1px solid var(--clr-accent);
        border: var(--focus-border);
        /* box-shadow: 0 0 3px var(--clr-accent); */
        outline: var(--focus-border);
    }

    .input-icon + input {
        padding-left: 40px;
    }

    .result-area {
        display: none;
        position: absolute;
        width: calc(100% - 10px);
        max-height: 500px;
        overflow-y: auto;
        top: 100%;
        background: var(--clr-white);
        box-shadow: 0 0 10px gray;
        margin: 5px;
        z-index: 2;
    }

    input:focus + .result-area,
    .result-area:hover {
        display: block;
    }
}
</style>
