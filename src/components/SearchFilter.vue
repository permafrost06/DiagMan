<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { nextTick, ref } from "vue";
import { setCursor as setCursorEl } from "@/helpers/ui";
import Icon from "./base/Icon.vue";
import { valueToFilter } from "@/helpers/search-filter";

interface InputProps {
    class?: any;
    modelValue: string;
    onUpdate?: (val: Record<string, string>) => void;
}
const props = defineProps<InputProps>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();
defineExpose({
    setCursor,
});
const inputEl = ref<HTMLInputElement>();

async function setCursor(col: string) {
    if (!inputEl.value) {
        return;
    }
    inputEl.value.focus();

    const filterObj = valueToFilter(props.modelValue);
    const all = filterObj.all;
    if (all) {
        delete filterObj.all;
    }
    let value = "";
    for (const i in filterObj) {
        if (filterObj[i]) {
            value += i + ":" + filterObj[i] + " ";
        }
    }

    let idx = value.indexOf(col + ":");
    if (idx === -1) {
        idx = value.length;
        value += col + ": ";
    }

    if (all) {
        value += all;
    }

    emit("update:modelValue", value);

    await nextTick();

    const from = idx + col.length + 1;
    const to = value.indexOf(" ", from);
    if (to === -1) {
        setCursorEl(inputEl.value, from, value.length);
        return;
    }
    setCursorEl(inputEl.value, from, to);
}

let tOut: any = 0;
const onInput = (evt: any) => {
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = setTimeout(() => {
        tOut = 0;
        emit("update:modelValue", evt.target.value);
        props.onUpdate && props.onUpdate(valueToFilter(evt.target.value));
    }, 500);
};
</script>
<template>
    <div :class="['search-filter', props.class]">
        <Icon size="16" viewBox="512">
            <path
                fill="currentColor"
                d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0 0 34.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 0 0 327.3 362.6l94.09 94.09a25 25 0 0 0 35.3-35.3ZM97.92 222.72a124.8 124.8 0 1 1 124.8 124.8a124.95 124.95 0 0 1-124.8-124.8Z"
            />
        </Icon>
        <input
            ref="inputEl"
            type="search"
            v-bind="$attrs"
            :value="props.modelValue"
            @input="onInput"
        />
    </div>
</template>

<style lang="scss">
.search-filter {
    position: relative;
}

.search-filter svg {
    position: absolute;
    left: 7px;
    top: 50%;
    transform: translateY(-50%);
}

.search-filter input {
    width: 100%;
    min-height: 100%;
    border: 1px solid var(--clr-black);
    padding: 5px 8px;
    padding-left: 25px;
}
</style>
