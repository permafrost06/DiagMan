<template>
  <h1 class="heading">Pending Patients</h1>
  <router-link :to="{ name: 'AddRecord' }">
    <button class="add-button" :disabled="syncing">
      Add Patient
    </button>
  </router-link>
  <button class="sync-button" @click="startSync">
    Sync Now
  </button>
  <template v-if="syncing">Syncing. Please wait...</template>
  <div class="id-search-container">
    <input
      class="id-search"
      type="text"
      placeholder="Filter patients by ID"
      v-model="search_id"
    />
  </div>
  <table :style="cssVars">
    <thead>
      <tr>
        <th>
          <div>Patient Name</div>
        </th>
        <th>
          <div>Date</div>
        </th>
        <th>
          <div>Age</div>
        </th>
        <th>
          <div>Specimen</div>
        </th>
        <th>
          <div>Referer</div>
        </th>
        <th />
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="record in filteredPatients" :key="record._id">
        <recordRow v-bind="record" @delete="deleteStaged">
          <router-link :to="{ name: 'Invoice', params: { id: record._id } }">
            <button style="padding: 0px .5rem">
              Invoice
            </button>
          </router-link>
          <router-link
            :to="{ name: 'finalizeRecord', params: { id: record._id } }"
          >
            <button style="margin-top: .75rem;padding: 0px .5rem">
              Finalize
            </button>
          </router-link>
        </recordRow>
      </tr>
    </tbody>
  </table>
</template>

<script>
import recordRow from "./recordRow.vue";

const ipc = window.ipcRenderer;
const log = require("electron-log");

export default {
  name: "recordsTable",
  components: {
    recordRow,
  },
  methods: {
    getWidth() {
      this.clientWidth = ipc.sendSync("get-width");
    },
    updateData(ids) {
      var options = {};

      if (ids) {
        options = ids;
      }

      options.limit = null;

      this.records = ipc.sendSync("get-staged", options, {
        patientNameFilter: this.patientNameFilter,
        dateFilter: this.dateFilter,
        ageFilter: this.ageFilter,
        specimenFilter: this.specimenFilter,
        refererFilter: this.refererFilter,
      });

      this.records.sort((patient_a, patient_b) => {
        patient_a._id.toLowerCase().localeCompare(patient_b._id.toLowerCase());
      });
    },
    handleSelectAll() {
      const currentSelection = this.selectedRecords;
      this.selectedRecords = this.records.map((record) => record._id);
      this.exportRecords();
      this.selectedRecords = currentSelection;
    },
    exportRecords() {
      ipc.send("export", JSON.stringify(this.selectedRecords));
    },
    deleteStaged(data) {
      ipc.send("delete-staged", data);
    },
    async connectedToInternet() {
      let response;
      try {
        response = await fetch(
          "https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg",
          { cache: "no-store" }
        );
      } catch (e) {
        return false;
      }

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    },
    async startSync() {
      if (await this.connectedToInternet()) {
        this.syncing = true;
        ipc.send("start-sync");
        log.info("patientsTable.vue: connection online, starting sync");
      } else {
        log.warn("patientsTable.vue: connection offline, sync cancelled");
        this.syncing = false;
      }
    },
  },
  computed: {
    cssVars() {
      return {
        "--col1w": this.clientWidth * 0.2 + "px",
        "--col2w": this.clientWidth * 0.1 + "px",
        "--col3w": this.clientWidth * 0.1 + "px",
        "--col4w": this.clientWidth * 0.2 + "px",
        "--col5w": this.clientWidth * 0.2 + "px",
        "--col6w": this.clientWidth * 0.05 + "px",
        "--col7w": this.clientWidth * 0.05 + "px",
      };
    },
    filteredPatients() {
      return this.records.filter((record) =>
        record._id.toLowerCase().includes(this.search_id.toLowerCase())
      );
    },
  },
  data() {
    return {
      clientWidth: null,
      selectAll: false,
      patientNameFilter: "",
      dateFilter: "",
      ageFilter: "",
      specimenFilter: "",
      refererFilter: "",
      records: [],
      timer: null,
      syncing: false,
      search_id: "",
    };
  },
  beforeMount() {
    this.getWidth();
    ipc.on("resized", () => {
      this.getWidth();
    });

    this.updateData();

    ipc.on("db-updated", () => {
      this.updateData();
    });

    ipc.on("sync-complete", () => {
      this.syncing = false;
      this.updateData();
    });

    ipc.on("sync-error", () => {
      this.syncing = false;
      log.error("patientsTable.vue: sync error!");
    });
  },
  mounted() {
    this.timer = setInterval(() => {
      this.startSync();
    }, 60 * 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="scss" scoped>
table td,
table th {
  overflow: hidden;
}
table th:nth-of-type(1),
table td:nth-of-type(1) {
  width: var(--col1w);
}
table th:nth-of-type(2),
table td:nth-of-type(2) {
  width: var(--col2w);
}
table th:nth-of-type(3),
table td:nth-of-type(3) {
  width: var(--col3w);
}
table th:nth-of-type(4),
table td:nth-of-type(4) {
  width: var(--col4w);
}
table th:nth-of-type(5),
table td:nth-of-type(5) {
  width: var(--col5w);
}
table th:nth-of-type(6),
table td:nth-of-type(6) {
  width: var(--col6w);
}
table th:nth-of-type(7),
table td:nth-of-type(7) {
  width: var(--col7w);
}
table th:nth-of-type(8),
table td:nth-of-type(8) {
  width: var(--col8w);
}
table th:nth-of-type(9),
table td:nth-of-type(9) {
  width: var(--col9w);
}
table th:nth-of-type(10),
table td:nth-of-type(10) {
  width: var(--col10w);
}

table {
  max-width: 72rem;
  margin-top: 20px;
  border-top: 2px solid #c0c0c080;
  border-collapse: collapse;
  table-layout: fixed;
  width: calc(
    var(--col1w) + var(--col2w) + var(--col3w) + var(--col4w) + var(--col5w) +
      var(--col6w) + var(--col7w) + var(--col8w)
  );

  thead {
    border-bottom: 2px solid #c0c0c080;
  }
  margin-inline: auto;
}

button:disabled {
  color: gray;
  background: #0f3842;
}

.sync-button {
  width: auto;
  margin: 1rem;
  padding: 0.25rem 1rem;
}

.add-button {
  width: auto;
  margin: 1rem;
  padding: 0.25rem 1rem;
}

.heading {
  display: inline-block;
  margin: 1rem;
}
</style>
