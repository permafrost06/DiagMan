<template>
  <div class="settings-page">
    <h1>Settings</h1>
    <div class="settings-tests">
      <h2>Tests</h2>
      <ul v-for="test in tests" :key="test._id">
        <testEntry v-bind="test" />
      </ul>
      <span v-if="add"
        ><input placeholder="Test Name" v-model="newTestName" /><input
          placeholder="Test Cost"
          v-model="newTestCost"
        />
        <button @click="addTestToDB">Add</button></span
      >
      <button v-else @click="addTest">Add New Test</button>
    </div>
  </div>
</template>

<script>
import testEntry from "../components/testEntry.vue";
export default {
  components: { testEntry },
  data() {
    return {
      add: false,
      tests: [
        {
          _id: 1,
          name: "test_1",
          cost: 100,
        },
        {
          _id: 2,
          name: "test_2",
          cost: 200,
        },
      ],
    };
  },
  methods: {
    addTest() {
      this.add = true;
    },
    addTestToDB() {
      console.log(this.newTestName, this.newTestCost);
      this.newTestName = "";
      this.newTestCost = "";
      this.add = false;
    },
  },
};
</script>

<style lang="scss" scoped>
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
</style>
