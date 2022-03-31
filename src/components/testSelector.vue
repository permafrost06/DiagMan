<template>
  <div ref="parentEl">
    <div
      class="test-selector-container"
      v-for="(n, index) in testList.length + 1"
      :key="n"
    >
      <select
        class="test-selector"
        v-model="testList[index]"
        :ref="'testSelector' + index"
      >
        <option
          v-for="test in tests"
          :hidden="isTestSelected(test._id)"
          :key="test._id"
          :value="test._id"
        >
          {{ test.name }} - {{ test.size }} : BDT{{ test.cost }}
        </option>
        <option v-if="index == testList.length" value="addNew"
          >Add new test...</option
        >
      </select>
      <button
        class="cross-button"
        v-if="testList[index]"
        @click="clearTest(index)"
      >
        X
      </button>
    </div>
    <div class="add-new-test" v-if="add">
      <input class="test test-code" placeholder="Test ID" v-model="newTestid" />
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
      <button style="margin-left: .25rem;" @click="addTestToDB">Add</button>
      <button style="margin-left: .25rem;" @click="cancelAdd">Cancel</button>
    </div>
  </div>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  name: "testSelector",
  props: {
    tests: Array,
  },
  data() {
    return {
      testList: [],
      add: false,
      newTestid: "",
      newTestName: "",
      newTestCost: 0,
      newTestType: "",
      newTestSize: "",
    };
  },
  methods: {
    clearTest(index) {
      const value = this.testList[index];
      this.testList = this.testList.filter((test) => test != value);
      this.$refs["testSelector" + index].value = null;
      this.emitUpdate();
    },
    cancelAdd() {
      this.newTestid = "";
      this.newTestName = "";
      this.newTestType = "";
      this.newTestSize = "";
      this.newTestCost = 0;
      this.add = false;
      this.showHiddenEls();
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
      this.showHiddenEls();
      this.emitTestsUpdate();
      // on new test addition create new select element select the new test
    },
    isTestSelected(id) {
      if (this.testList.includes(id)) return true;
      else return false;
    },
    emitUpdate() {
      this.$emit(
        "updated",
        this.testList.filter((test) => test != "none" && test != "addNew")
      );
    },
    emitTestsUpdate() {
      this.$emit("tests-updated");
    },
    showHiddenEls() {
      this.testList.pop();
      const selectEls = this.$refs.parentEl.querySelectorAll(
        ".test-selector-container"
      );
      selectEls[selectEls.length - 1].style.display = "block";
      selectEls[selectEls.length - 2].style.display = "block";
    },
  },
  mounted() {
    ipc.on("test-added", (event, newTestID) => {
      this.emitTestsUpdate();
      this.testList.push(newTestID);
    });
  },
  updated() {
    if (this.testList.includes("addNew")) {
      this.add = true;
      const selectEls = this.$refs.parentEl.querySelectorAll(
        ".test-selector-container"
      );
      selectEls[selectEls.length - 1].style.display = "none";
      selectEls[selectEls.length - 2].style.display = "none";
    } else {
      this.add = false;
    }

    this.emitUpdate();
  },
};
</script>

<style lang="scss" scoped>
.cross-button {
  width: auto;
  padding: 0.25rem;
  margin: 0 0.5rem;
}

.add-new-test {
  margin: 0.5rem 0;

  button {
    width: auto;
    padding: 0 0.5rem;
  }
  button,
  input,
  select {
    margin: 0 0.25rem;
  }
}
</style>
