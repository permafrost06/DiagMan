<template>
    <div class="single-test-selector">
        <select class="test-select" placeholder="Select a test" v-model="value">
            <option value="" hidden>Select a test</option>
            <option
                v-for="test in filteredTests"
                :key="test._id"
                :value="test._id"
            >
                <template v-if="test.size">
                    {{ test.name }} - {{ test.size }} : BDT{{ test.cost }}
                </template>
                <template v-else>
                    {{ test.name }} : BDT{{ test.cost }}
                </template>
            </option>
        </select>
        <slot></slot>
    </div>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
    props: {
        modelValue: String,
        type: String,
        hiddenTests: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            allTests: [],
        };
    },
    computed: {
        filteredTests() {
            return this.allTests.filter(
                (test) =>
                    test.type.toLowerCase() === this.type.toLowerCase() &&
                    !this.hiddenTests
                        .filter((test) => test != this.modelValue)
                        .includes(test._id)
            );
        },
        value: {
            get() {
                return this.modelValue ? this.modelValue : "";
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
    },
    beforeMount() {
        this.allTests = ipc.sendSync("get-tests");
    },
};
</script>

<style>
.test-select {
    width: 28.5rem;
}
</style>
