/* eslint-disable vue/no-v-for-template-key */
<template>
  <form>
    <select v-model="type">
      <option value="cyto" selected>Cytopathology</option>
      <option value="histo">Histopathology</option>
    </select>
    <br />
    Patient Name
    <input v-model="patientName" />
    <br />
    Date
    <input type="date" v-model="date" />
    <br />
    Age
    <input v-model="age" />
    <br />
    Gender
    <select v-model="gender">
      <option value="default" selected hidden>Choose gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
    <br />
    Contact No
    <input type="number" v-model="contactNo" />
    <br />
    Specimen
    <input v-model="specimen" />
    <br />
    Referer
    <input list="doctors" v-model="referer" />
    <datalist id="doctors">
      <template v-for="doctor in doctorList" :key="doctor">
        <option :value="doctor" />
      </template>
    </datalist>
    <br />
    <div class="checkboxes">
      <div class="test-entry" v-for="test in tests" :key="test._id">
        <input
          :id="'test-' + test._id"
          type="checkbox"
          :value="test._id"
          v-model="selectedTests"
        />
        <label :for="'test-' + test._id" class="description"
          >{{ test.name }} - BDT{{ test.cost }}</label
        >
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
      type: "cyto",
      patientName: "",
      date: new Date().toISOString().split("T")[0],
      age: "",
      gender: "default",
      contactNo: null,
      specimen: "",
      referer: "",
      tests: [],
      selectedTests: [],
      doctorList: [],
    };
  },
  methods: {
    addToStaged(event) {
      event.preventDefault();
      ipc.send("add-staged", {
        type: this.type,
        patientName: this.patientName,
        date: this.date,
        age: this.age,
        gender: this.gender,
        contactNo: this.contactNo,
        specimen: this.specimen,
        referer: this.referer,
        tests: JSON.stringify(this.selectedTests),
      });
      this.$router.push({ name: "Pending" });
    },
  },
  beforeMount() {
    this.tests = ipc.sendSync("get-tests");
    this.doctorList = ipc.sendSync("get-referers");
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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
