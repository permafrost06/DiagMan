<script setup lang="ts">
import type { InputHTMLAttributes } from "vue";

interface Props extends InputHTMLAttributes {
    hint?: string;
    hintType?: "error" | "warning" | "success" | "none";
    label?: string;
    class?: any;
    id?: string;
    type?: "checkbox";
    modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    hintType: "error",
});
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();
const onChange = (evt: any) => {
    emit("update:modelValue", evt.target.checked);
};
</script>
<template>
    <div :class="[props.class, 'sq-checkbox']">
        <div class="sq-checkbox-area">
            <label class="sq-field-box">
                <input
                    type="checkbox"
                    v-bind="$attrs"
                    :checked="modelValue"
                    @input="onChange"
                />
                <span class="checkmark"></span>
            </label>
            <label v-if="label" :for="id">{{ label }}</label>
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
<style lang="scss">
.sq-checkbox {
    .sq-checkbox-area {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .sq-field-box {
        position: relative;
        display: inline-block;
        cursor: pointer;
        width: 20px; /* Adjust the size of the checkbox */
        height: 20px;
    }

    .sq-field-box input {
        display: none;
    }

    .sq-field-box .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: var(--clr-white);
        border: 2px solid var(--clr-black);
    }
    .sq-field-box input:checked + .checkmark {
        background-color: var(--clr-black);
    }
    .sq-field-box input:checked + .checkmark::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px; /* Adjust the size of the checkmark */
        height: 10px; /* Adjust the size of the checkmark */
        border: solid var(--clr-white);
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -50%) rotate(45deg);
        margin-top: -2px;
    }

    .hint {
        font-size: var(--fs-sm);
        margin-left: 25px;
    }
}
</style>
