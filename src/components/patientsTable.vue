<template>
  <h1 style="display:inline-block;margin: 1rem">Pending Patients</h1>
  <router-link :to="{ name: 'AddRecord' }">
    <button
      style="width: auto; margin: 1rem; padding: .25rem 1rem;"
      :disabled="syncing"
    >
      Add Patient
    </button>
  </router-link>
  <button
    style="width: auto; margin: 1rem; padding: .25rem 1rem;"
    @click="startSync"
  >
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
      <tableRow>
        <tableHeader>
          <input
            style="display:none"
            type="checkbox"
            class="check"
            v-model="selectAll"
            @change="handleSelectAll"
          />
        </tableHeader>
        <tableHeader>
          <div>Patient Name</div>
          <!-- <categorySearch catName="patientName" @cat-search="search" /> -->
        </tableHeader>
        <tableHeader>
          <div>Date</div>
          <!-- <categorySearch catName="date" @cat-search="search" /> -->
        </tableHeader>
        <tableHeader>
          <div>Age</div>
          <!-- <categorySearch catName="age" @cat-search="search" /> -->
        </tableHeader>
        <tableHeader>
          <div>Specimen</div>
          <!-- <categorySearch catName="specimen" @cat-search="search" /> -->
        </tableHeader>
        <tableHeader>
          <div>Referer</div>
          <!-- <categorySearch catName="referer" @cat-search="search" /> -->
        </tableHeader>
        <tableHeader />
      </tableRow>
    </thead>
    <tbody>
      <tableRow v-for="record in filteredPatients" :key="record._id">
        <recordRow
          v-bind="record"
          @record-selection="updateSelection"
          @delete="deleteStaged"
        >
          <router-link :to="{ name: 'Invoice', params: { id: record._id } }">
            <button>
              Invoice
            </button>
          </router-link>
          <router-link
            :to="{ name: 'finalizeRecord', params: { id: record._id } }"
          >
            <button style="margin-top: .75rem;">
              Finalize
            </button>
          </router-link>
        </recordRow>
      </tableRow>
    </tbody>
  </table>

  <!-- <button
    style="width: auto; margin: 1rem; padding: .25rem 1rem;"
    @click="prevPage"
  >
    Previous
  </button>
  <button
    style="width: auto; margin: 1rem; padding: .25rem 1rem;"
    @click="nextPage"
  >
    Next
  </button> -->
</template>

<script>
import tableRow from "./tableRow.vue";
import tableHeader from "./tableHeader.vue";
// import categorySearch from "./categorySearch.vue";
import recordRow from "./recordRow.vue";

const ipc = window.ipcRenderer;
const log = require("electron-log");

export default {
  name: "recordsTable",
  components: {
    tableHeader,
    // categorySearch,
    tableRow,
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

      this.records = ipc
        .sendSync("get-staged", options, {
          patientNameFilter: this.patientNameFilter,
          dateFilter: this.dateFilter,
          ageFilter: this.ageFilter,
          specimenFilter: this.specimenFilter,
          refererFilter: this.refererFilter,
        })
        .sort((patient_a, patient_b) => {
          patient_a._id - patient_b._id;
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
    updateSelection(data) {
      if (data.operation == "add") {
        this.selectedRecords.push(data.record_id);
      } else {
        this.selectedRecords = this.selectedRecords.filter(
          (record) => record !== data.record_id
        );
      }
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
    // search(data) {
    //   const cat = data.cat;
    //   const value = data.value;

    //   switch (cat) {
    //     case "patientName":
    //       this.patientNameFilter = value;
    //       break;

    //     case "date":
    //       this.dateFilter = value;
    //       break;

    //     case "age":
    //       this.ageFilter = value;
    //       break;

    //     case "specimen":
    //       this.specimenFilter = value;
    //       break;

    //     case "referer":
    //       this.refererFilter = value;
    //       break;

    //     default:
    //       break;
    //   }
    //   this.updateData();
    // },
    // nextPage() {
    //   this.updateData({
    //     lastID: this.records[this.records.length - 1]._id,
    //   });
    // },
    // prevPage() {
    //   this.updateData({
    //     firstID: this.records[0]._id,
    //   });
    // },
  },
  computed: {
    cssVars() {
      return {
        "--col1w": 42 + "px",
        "--col2w": this.clientWidth * 0.2 + "px",
        "--col3w": this.clientWidth * 0.1 + "px",
        "--col4w": this.clientWidth * 0.1 + "px",
        "--col5w": this.clientWidth * 0.2 + "px",
        "--col6w": this.clientWidth * 0.2 + "px",
        "--col7w": this.clientWidth * 0.05 + "px",
        "--col8w": this.clientWidth * 0.06 + "px",
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
      selectedRecords: [],
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
// :root {
//   --col1w: 42px;
//   --col2w: 250px;
//   --col3w: 140px;
//   --col4w: 110px;
//   --col5w: 250px;
//   --col6w: 220px;
//   --col7w: 70px;
//   --col8w: 140px;
// }

// table column widths

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
}

button:disabled {
  color: gray;
  background: #0f3842;
}
</style>
