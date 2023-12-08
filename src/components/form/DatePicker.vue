<script setup lang="ts">
import { dateToDMY, dmyToDate } from "@/helpers/utils";
import { onMounted, ref, watch, type InputHTMLAttributes } from "vue";
// @ts-ignore
import datepicker from "js-datepicker";
import "js-datepicker/dist/datepicker.min.css";

interface Props extends InputHTMLAttributes {
    formatter?: (date: Date) => string;
    parser?: (text: string) => Date;
    modelValue?: string;
    value?: string;
}

const props = withDefaults(defineProps<Props>(), {
    formatter: dateToDMY,
    parser: dmyToDate,
});

const emit = defineEmits<{
    (evt: "update:modelValue", value: string): void;
}>();

const el = ref<HTMLInputElement>();
const iValue = ref(props.modelValue || props.value || "");

watch(props, (upt) => {
    iValue.value = upt.modelValue || upt.value || "";
});

const options = {
    showAllDates: true,
    formatter(input: HTMLInputElement, date: Date) {
        input.value = props.formatter(date);
    },
    onShow(ins: any) {
        const val = ins.el.value;
        if (val && val.length === 10) {
            ins.setDate(props.parser(val), true);
        }
        const el = ins.el.nextElementSibling as HTMLDivElement;
        const box = el.getBoundingClientRect();
        const pos: {
            top?: string;
            bottom?: string;
            right?: string;
            left?: string;
        } = {};

        if (box.right > screen.availWidth) {
            pos.right = "0px";
        } else {
            pos.left = "0px";
        }

        if (box.bottom > window.innerHeight) {
            pos.bottom = "100%";
        } else {
            pos.top = "100%";
        }
        el.removeAttribute("style");
        for (const i in pos) {
            // @ts-ignore
            el.style[i] = pos[i];
        }
    },
};

onMounted(() => {
    if (!el.value) {
        return;
    }
    datepicker(el.value, options);
});

const increment = () => {
    const date = props.parser(el.value?.value || "");
    date.setDate(date.getDate() + 1);
    iValue.value = props.formatter(date);
    emit("update:modelValue", iValue.value);
};
const decrement = () => {
    const date = props.parser(el.value?.value || "");
    date.setDate(date.getDate() - 1);
    iValue.value = props.formatter(date);
    emit("update:modelValue", iValue.value);
};
</script>
<template>
    <div class="datep-f-wrapper">
        <button type="button" class="date-dec" @click="decrement">-</button>
        <input
            v-bind="$attrs"
            ref="el"
            type="text"
            autocomplete="off"
            :value="iValue"
            @input="(evt: any) => emit('update:modelValue', evt.target.value)"
        />
        <button type="button" class="date-inc" @click="increment">+</button>
    </div>
</template>

<style lang="scss" scoped>
.datep-f-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;

    input {
        flex-grow: 1;
        padding-right: 20px !important;
    }

    button {
        border: 1px solid var(--clr-black);
        padding: 1px 8px;
        background: none;
        color: var(--clr-black);
        font-size: var(--fs-base);
    }
}
</style>
<script lang="ts">
export default {
    inheritAttrs: false,
};
</script>
