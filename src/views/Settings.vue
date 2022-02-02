<template>
  <div class="settings-page">
    <h1>Settings</h1>
    <div class="settings-tests">
      <h2>Tests</h2>
      <div class="test test-code bold">Code</div>
      <div class="test test-name bold">Test Name</div>
      <div class="test test-cost bold">Cost</div>
      <ul v-for="test in tests" :key="test._id">
        <testEntry
          v-bind="test"
          @test-update="updateTest"
          @test-delete="deleteTest"
        />
      </ul>
      <span v-if="add">
        <input placeholder="Test ID" v-model="newTestid" />
        <input placeholder="Test Name" v-model="newTestName" />
        <input placeholder="Test Cost" type="number" v-model="newTestCost" />
        <button @click="addTestToDB">Add</button>
      </span>
      <button v-else @click="addTest">Add New Test</button>
    </div>
  </div>
</template>

<script>
const ipc = window.ipcRenderer;

import testEntry from "../components/testEntry.vue";
export default {
  components: { testEntry },
  data() {
    return {
      add: false,
      tests: [],
      newTestid: "",
      newTestName: "",
      newTestCost: 0,
    };
  },
  methods: {
    refreshTests() {
      this.tests = ipc.sendSync("get-tests");
    },
    updateTest(data) {
      ipc.send("update-test", data);
    },
    deleteTest(id) {
      ipc.send("test-delete", id);
    },
    addTest() {
      this.add = true;
    },
    addTestToDB() {
      ipc.send("add-test", {
        _id: this.newTestid,
        name: this.newTestName,
        cost: Number(this.newTestCost),
      });
      this.newTestid = "";
      this.newTestName = "";
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
    width: 10rem;
    margin: 0.5rem;
  }
}

.test {
  display: inline-block;
}

.test-code {
  width: 3rem;
}

.test-name {
  width: 15rem;
}

.test-cost {
  width: 3rem;
  text-align: right;
}
</style>
