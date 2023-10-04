<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, type InputHTMLAttributes } from "vue";
import Icon from "./base/Icon.vue";

interface InputProps extends InputHTMLAttributes {
    class?: any;
    value: string;
    cursor?: string;
}
const props = defineProps<InputProps>();
const emit = defineEmits<{
    (e: "update", value: string): void;
}>();

const inputEl = ref<HTMLInputElement>();

let tOut = 0;
const onInput = (evt: any) => {
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = setTimeout(() => {
        emit("update", evt.target.value);
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
            :value="value"
            @input="onInput"
        />
    </div>
</template>
