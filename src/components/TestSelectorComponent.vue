<template>
    <div class="test-selector-wrapper">
        <SingleTestSelect
            v-for="(n, index) in modelValue.length + 1"
            :key="n"
            :type="type"
            :hiddenTests="modelValue"
            :modelValue="modelValue[index]"
            @update:modelValue="updateIndex($event, index)"
        >
            <button
                class="cross-button"
                v-if="index < modelValue.length"
                @click="removeTest(index)"
            >
                X
            </button>
        </SingleTestSelect>
    </div>
</template>

<script>
import SingleTestSelect from "./SingleTestSelectComponent.vue";

export default {
    components: {
        SingleTestSelect,
    },
    props: {
        modelValue: Array,
        type: String,
    },
    emits: ["update:modelValue"],
    methods: {
        updateValue(value) {
            this.$emit("update:modelValue", value);
        },
        updateIndex(value, index) {
            const newArr = [...this.modelValue];
            newArr[index] = value;
            this.updateValue(newArr);
        },
        removeTest(index) {
            const newArr = [...this.modelValue];
            this.updateValue(newArr.filter((_, i) => i != index));
        },
    },
};
</script>

<style>
.cross-button {
    padding: 0.25rem 0.5rem;
}

.test-selector-wrapper {
    margin: 0.5rem 0 1rem 0;

    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
</style>
