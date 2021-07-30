<template>
  <addRecord v-if="staging" @hide="stagingDone" />
  <finalizeRecord v-bind="finalizeRcd" @hide="finalizeDone" v-if="final" />
  <recordsTable v-if="records" />

  <patientsTable
    @finalize-staged="finalize"
    @add-patient="openStaging"
    v-else-if="staged"
  />

  <br />

  <button class="sm-button" @click="changeView" v-if="records">Staged</button>
  <button class="sm-button" @click="changeView" v-else-if="staged">
    Records
  </button>
</template>

<script>
import patientsTable from "./components/patientsTable.vue";
import recordsTable from "./components/recordsTable.vue";
import addRecord from "./components/addRecord.vue";
import finalizeRecord from "./components/finalizeRecord.vue";

const ipc = window.ipcRenderer;

export default {
  name: "App",
  components: {
    recordsTable,
    patientsTable,
    addRecord,
    finalizeRecord,
  },
  data() {
    return {
      records: false,
      staged: true,
      staging: false,
      finalizeRcd: {},
      final: false,
    };
  },
  methods: {
    changeView() {
      this.records = !this.records;
      this.staged = !this.staged;
    },
    stagingDone() {
      this.staging = false;
      this.staged = true;
    },
    openStaging() {
      this.staging = true;
      this.staged = false;
    },
    finalize(id) {
      this.final = true;
      this.staged = false;
      this.finalizeRcd = ipc.sendSync("get-record", id);
    },
    finalizeDone() {
      this.final = false;
      this.staged = true;
    },
  },
};
</script>

<style>
@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-BoldItalic.ttf") format("truetype");
  font-weight: bold;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-Italic.ttf") format("truetype");
  font-weight: normal;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-Bold.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-Light.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-LightItalic.ttf") format("truetype");
  font-weight: 300;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-Medium.ttf") format("truetype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Ubuntu";
  src: url("~@/assets/Ubuntu-MediumItalic.ttf") format("truetype");
  font-weight: 500;
  font-style: italic;
  font-display: swap;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Ubuntu", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  color: #17768d;
  margin-bottom: 1rem;
}

h5 {
  color: #17768d;
  font-weight: Bold;
  font-size: 1rem;
}

small {
  color: #a2a2a2;
  font-size: 0.8rem;
}

.sm-button {
  width: auto;
  margin: 1rem;
  padding: 0.25rem 1rem;
}
</style>
