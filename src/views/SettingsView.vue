<template>
    <div class="settings-page">
        <h1>Settings</h1>
        <div class="settings-tests">
            <h2>Tests</h2>
            <div class="test test-code bold">Code</div>
            <div class="test test-name bold">Test Name</div>
            <div class="test test-type bold">Test Type</div>
            <div class="test test-size bold">Test Size</div>
            <div class="test test-cost bold">Cost</div>
            <ul v-for="test in tests" :key="test._id">
                <testEntry v-bind="test" @test-delete="deleteTest" />
            </ul>
            <br />
            <span v-if="add">
                <input
                    class="test test-code"
                    placeholder="Test ID"
                    v-model="newTestid"
                />
                <input
                    class="test test-name"
                    placeholder="Test Name"
                    v-model="newTestName"
                />
                <select class="test test-type" v-model="newTestType">
                    <option value="" selected hidden>Choose Test Type</option>
                    <option value="Cyto">Cytopathology</option>
                    <option value="Histo">Histopathology</option>
                </select>
                <select class="test test-size" v-model="newTestSize">
                    <option value="" selected hidden>Choose Test Size</option>
                    <option value="Complex">Complex</option>
                    <option value="Large">Large</option>
                    <option value="Medium">Medium</option>
                    <option value="Small">Small</option>
                </select>
                <input
                    class="test test-cost"
                    placeholder="Test Cost"
                    type="number"
                    v-model="newTestCost"
                />
                <button @click="addTestToDB">
                    Add
                </button>
                <button @click="cancelAdd">
                    Cancel
                </button>
            </span>
            <button v-else @click="addTest">Add New Test</button>
        </div>
    </div>
</template>

<script>
const ipc = window.ipcRenderer;

import testEntry from "../components/TestEntryComponent.vue";
export default {
    components: { testEntry },
    data() {
        return {
            add: false,
            tests: [],
            newTestid: "",
            newTestName: "",
            newTestCost: 0,
            newTestType: "",
            newTestSize: "",
        };
    },
    methods: {
        refreshTests() {
            this.tests = ipc.sendSync("get-tests");
        },
        deleteTest(id) {
            ipc.send("test-delete", id);
        },
        addTest() {
            this.add = true;
        },
        cancelAdd() {
            this.newTestid = "";
            this.newTestName = "";
            this.newTestType = "";
            this.newTestSize = "";
            this.newTestCost = 0;
            this.add = false;
        },
        addTestToDB() {
            ipc.send("add-test", {
                _id: this.newTestid,
                name: this.newTestName,
                type: this.newTestType,
                size: this.newTestSize,
                cost: Number(this.newTestCost),
            });
            this.newTestid = "";
            this.newTestName = "";
            this.newTestType = "";
            this.newTestSize = "";
            this.newTestCost = 0;
            this.add = false;
        },
    },
    beforeMount() {
        this.refreshTests();
        ipc.on("db-update", () => {
            this.refreshTests();
        });
    },
};
</script>

<style lang="scss">
.settings-page {
    margin: 1rem 3rem;

    button {
        height: auto;
        width: auto;
        padding: 0.4rem 1rem;
    }
}

.settings-tests {
    ul {
        list-style: none;
    }

    input {
        font-size: 1rem;
        padding: 0.15rem 0.25rem;
    }
}

.test {
    display: inline-block;
}

.test-code {
    width: 5rem;
}

.test-name {
    width: 15rem;
}

.test-type {
    width: 10rem;
}

.test-size {
    width: 8rem;
}

.test-cost {
    width: 5rem;
    text-align: right;
}
</style>
