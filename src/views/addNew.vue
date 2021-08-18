<template>
  <form>
    Patient Name
    <input v-model="patientName" />
    <br />
    Date
    <input v-model="date" />
    <br />
    Age
    <input v-model="age" />
    <br />
    Specimen
    <input v-model="specimen" />
    <br />
    Referer
    <input v-model="referer" />
    <br />
    <div class="checkboxes">
      <div class="test" v-for="test in tests" :key="test.id">
        <input type="checkbox" :value="test.id" v-model="selectedTests" />
        <div class="description">{{ test.name }} - BDT{{ test.cost }}</div>
      </div>
    </div>
    <br />
    <button @click="addToStaged" style="width:8rem;">Add</button>
    <router-link to="/">
      <button style="width:8rem;">Cancel</button>
    </router-link>
  </form>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  data() {
    return {
      patientName: "",
      date: "",
      age: "",
      specimen: "",
      referer: "",
      tests: [
        {
          id: 1,
          name: "test_1",
          cost: 100,
        },
        {
          id: 2,
          name: "test_2",
          cost: 200,
        },
      ],
      selectedTests: [],
    };
  },
  methods: {
    addToStaged(event) {
      event.preventDefault();
      ipc.send("add-staged", {
        patientName: this.patientName,
        date: this.date,
        age: this.age,
        specimen: this.specimen,
        referer: this.referer,
      });
      this.$router.push({ name: "Pending" });
    },
  },
};
</script>

<style lang="scss" scoped>
input {
  width: 50vw;
}

.large {
  height: 10ch;
}

* {
  margin: 0.5rem 0.25rem;
}

.checkboxes {
  input {
    width: unset;
    margin: 0;
    margin-right: 0.5rem;
    height: auto;
  }

  .description {
    display: inline-block;
  }
}
</style>
