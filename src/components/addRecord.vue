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
    <button @click="addToStaged" style="width:8rem;">Add</button>
    <button @click="hide" style="width:8rem;">Cancel</button>
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
    };
  },
  methods: {
    addToStaged() {
      ipc.send("add-staged", {
        patientName: this.patientName,
        date: this.date,
        age: this.age,
        specimen: this.specimen,
        referer: this.referer,
      });
    },
    hide() {
      this.$emit("hide");
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
</style>
