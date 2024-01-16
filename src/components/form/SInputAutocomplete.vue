<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

interface InputProps {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    placeholder?: string;
    class?: any;
    url: (val: string) => string;
    cachedSearch?: (all: Array<any>, search: string) => Array<any>;
    modelValue?: any;
    unWrap?: boolean;
    id?: string;
    fieldClass?: any;
}

const results = ref<Record<string, any>[]>([]);
const allResults = ref<Record<string, any>[]>([]);
const inputRef = ref<HTMLInputElement>();

const props = withDefaults(defineProps<InputProps>(), {
    type: "text",
    hintType: "error",
});
const emit = defineEmits<{
    (e: "update:modelValue", val: string): void;
}>();

let tOut: any = 0,
    ctrl = new AbortController(),
    fetchVal: string = "";

const fetchResults = async () => {
    if (props.cachedSearch && allResults.value.length > 0) {
        results.value = props.cachedSearch(allResults.value, fetchVal);
        return;
    }

    const res = await fetchApi(props.url(fetchVal), {
        signal: ctrl.signal,
    });
    if (!res.success) {
        console.error(
            res.message || "Request failed with error code: " + res.status
        );
        return;
    }
    if (!props.cachedSearch) {
        results.value = res.rows;
        return;
    }
    allResults.value = res.rows;
    results.value = props.cachedSearch(
        allResults.value,
        inputRef.value?.value || ""
    );
};

const handleInput = (evt: any) => {
    fetchVal = evt.target.value;
    emit("update:modelValue", fetchVal);
    if (tOut) {
        clearTimeout(tOut);
        if (!props.cachedSearch) {
            ctrl.abort();
            ctrl = new AbortController();
        }
    }
    tOut = setTimeout(fetchResults, 500);
};

onMounted(() => {
    handleInput({
        target: {
            value: "",
        },
    });
});

function handleClick(val: string) {
    (document.querySelector(".result-area")! as HTMLDivElement).style.display =
        "none";
    setTimeout(() => {
        (
            document.querySelector(".result-area")! as HTMLDivElement
        ).style.removeProperty("display");
    }, 5);

    emit("update:modelValue", val);
    // @ts-ignore
    inputRef.value.value = val;
}
</script>
<template>
    <div v-if="!unWrap" :class="[props.class, 'simple-input-autocomplete']">
        <label :for="id" class="si-label" v-if="label">{{ label }}</label>
        <div class="si-field-col">
            <input
                ref="inputRef"
                type="text"
                autocomplete="off"
                v-bind="$attrs"
                :class="fieldClass"
                :id="id"
                :placeholder="placeholder || label"
                :value="modelValue"
                @input="handleInput"
            />
            <div class="result-area">
                <slot :accept="handleClick" :results="results"></slot>
            </div>

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
                ref="inputRef"
                type="text"
                autocomplete="off"
                v-bind="$attrs"
                :class="fieldClass"
                :id="id"
                :placeholder="placeholder || label"
                :value="modelValue"
                @input="handleInput"
            />
            <div class="result-area">
                <slot :accept="handleClick" :results="results"></slot>
            </div>

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
.simple-input-autocomplete {
    display: flex;
    gap: 10px;
}

.si-label {
    font-size: var(--fs-base);
}

.si-field-col {
    position: relative;
    flex-grow: 1;

    input {
        display: block;
        width: 100%;
        padding: 3px 5px;
    }
    .result-area {
        display: none;
        position: absolute;
        width: calc(100% - 6px);
        max-height: 500px;
        overflow-y: auto;
        top: 100%;
        background: var(--clr-white);
        box-shadow: 0 0 7px #d7d7d7;
        margin: 3px;
        z-index: 2;
    }

    input:focus + .result-area,
    .result-area:hover {
        display: block;
    }

    .hint {
        font-size: var(--fs-sm);
        margin-top: 2px;
    }

    .hint.error {
        color: var(--clr-danger);
    }

    .hint.success {
        color: var(--clr-success);
    }

    .hint.warning {
        color: var(--clr-warning);
    }
}
</style>
