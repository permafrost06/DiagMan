<script setup lang="ts">
import { onMounted, ref, watch, type InputHTMLAttributes } from "vue";
// @ts-ignore
import datepicker from "js-datepicker";
import "js-datepicker/dist/datepicker.min.css";
import { dateToDMY } from "@/helpers/utils";

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
    formatter?: (date: Date) => string;
    parser?: (val: string) => Date;
    modelValue?: Date | string;
    value?: Date | string;
    name?: string;
}

const props = withDefaults(defineProps<Props>(), {
    formatter: (date: Date) =>
        date
            .toDateString()
            .replace(" " + date.getFullYear(), ", " + date.getFullYear()),
});

const emit = defineEmits<{
    (evt: "update:modelValue", value: Date): void;
}>();

const el = ref<HTMLInputElement>();
const iValue = ref("");

const curVal = ref<Date>();

watch(props, (upt) => {
    updateDateExternal(upt.modelValue || upt.value);
});

const options = {
    showAllDates: true,
    formatter(input: HTMLInputElement, date: Date) {
        input.value = props.formatter(date);
    },
    onShow(ins: any) {
        if (curVal.value) {
            ins.setDate(curVal.value, true);
        }
        const el = ins.el.parentElement.lastElementChild as HTMLDivElement;
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
        insertButtons(el, ins);
    },
    onSelect: (_: any, date: Date) => {
        updateDate(date);
    },
};

onMounted(() => {
    if (!el.value) {
        return;
    }
    datepicker(el.value, options);
    updateDateExternal(props.modelValue || props.value);
});

function updateDateExternal(date?: string | Date) {
    if (!date) {
        return;
    }
    if (typeof date !== "object") {
        updateDate(new Date(date));
    } else {
        updateDate(date);
    }
}

function updateDate(date: Date) {
    curVal.value = date;
    iValue.value = props.formatter(curVal.value);
}

function insertButtons(el: HTMLDivElement, ins: any) {
    if (el.querySelector(":scope > .date-picker-custom-buttons")) {
        return;
    }

    const mainDiv = document.createElement("div");
    mainDiv.className = "date-picker-custom-buttons";
    const btn1 = document.createElement("button");
    btn1.type = "button";
    btn1.innerHTML = "Today";

    mainDiv.appendChild(btn1);

    const btn2 = btn1.cloneNode() as HTMLButtonElement;
    btn2.innerHTML = "+7 Days";
    mainDiv.appendChild(btn2);

    btn1.addEventListener("click", () => {
        updateDate(new Date());
        ins.setDate(curVal.value, true);
    });

    btn2.addEventListener("click", () => {
        increment(7);
        ins.setDate(curVal.value, true);
    });

    el.appendChild(mainDiv);
}

function increment(days: number = 1) {
    const date = curVal.value || new Date();
    date.setDate(date.getDate() + days);
    updateDate(date);
    emit("update:modelValue", date);
}
const decrement = () => {
    const date = curVal.value || new Date();
    date.setDate(date.getDate() - 1);
    updateDate(date);
    emit("update:modelValue", date);
};

const onBlur = () => {
    if (!props.parser || !el.value) {
        return;
    }
    updateDate(props.parser(el.value.value));
};
</script>
<template>
    <div class="datep-f-wrapper">
        <button type="button" class="date-dec" @click="decrement">-</button>
        <input
            v-if="name"
            type="hidden"
            :name="name"
            :value="curVal ? dateToDMY(curVal) : ''"
        />
        <input
            v-bind="$attrs"
            ref="el"
            type="text"
            autocomplete="off"
            :readonly="!props.parser"
            :value="iValue"
            @input="(evt: any) => emit('update:modelValue', evt.target.value)"
            @blur="onBlur"
        />
        <button type="button" class="date-inc" @click="() => increment()">
            +
        </button>
    </div>
</template>

<style lang="scss">
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

    .date-picker-custom-buttons {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 5px;
    }
}
</style>
<script lang="ts">
export default {
    inheritAttrs: false,
};
</script>
