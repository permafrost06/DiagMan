<template>
  <button
    style="width: auto; margin: 1rem; padding: .25rem 1rem;"
    @click="exportRecords"
  >
    Export selected
  </button>
  <table :style="cssVars">
    <thead>
      <tableRow>
        <tableHeader>
          <input
            type="checkbox"
            class="check"
            v-model="selectAll"
            @change="handleSelectAll"
          />
        </tableHeader>
        <tableHeader>
          <div>Patient Name</div>
          <categorySearch catName="patientName" @cat-search="search" />
        </tableHeader>
        <tableHeader>
          <div>Date</div>
          <categorySearch catName="date" @cat-search="search" />
        </tableHeader>
        <tableHeader>
          <div>Age</div>
          <categorySearch catName="age" @cat-search="search" />
        </tableHeader>
        <tableHeader>
          <div>Specimen</div>
          <categorySearch catName="specimen" @cat-search="search" />
        </tableHeader>
        <tableHeader>
          <div>Referer</div>
          <categorySearch catName="referer" @cat-search="search" />
        </tableHeader>
        <tableHeader />
        <tableHeader />
      </tableRow>
    </thead>
    <tbody>
      <tableRow v-for="record in filteredRecords" :key="record.id">
        <recordRow
          v-bind="record"
          @record-updated="updateRecord"
          @record-selection="updateSelection"
        />
      </tableRow>
    </tbody>
  </table>
</template>

<script>
import tableRow from "./tableRow.vue";
import tableHeader from "./tableHeader.vue";
import categorySearch from "./categorySearch.vue";
import recordRow from "./recordRow.vue";

import recordsjson from "./records.json";

const ipc = window.ipcRenderer;

export default {
  name: "recordsTable",
  components: {
    tableHeader,
    categorySearch,
    tableRow,
    recordRow,
  },
  methods: {
    handleSelectAll() {
      if (this.selectAll) {
        this.selectedRecords = this.filteredRecords;
      } else {
        this.selectedRecords = [];
      }
    },
    exportRecords() {
      console.log(this.selectedRecords);
      ipc.send("export", JSON.stringify(this.selectedRecords));
    },
    updateSelection(data) {
      const selectedRecord = this.filteredRecords.filter(
        (record) => record.id == data.record_id
      );

      if (data.operation == "add") {
        this.selectedRecords.push(selectedRecord[0]);
      } else {
        this.selectedRecords = this.selectedRecords.filter(
          (record) => record !== selectedRecord[0]
        );
      }
    },
    updateRecord(data) {
      var index = this.records.findIndex(function(record) {
        return record.id == data.id;
      });

      this.records.splice(index, 1, data);
    },
    search(data) {
      const cat = data.cat;
      const value = data.value;

      switch (cat) {
        case "patientName":
          this.patientNameFilter = value;
          break;

        case "date":
          this.dateFilter = value;
          break;

        case "age":
          this.ageFilter = value;
          break;

        case "specimen":
          this.specimenFilter = value;
          break;

        case "referer":
          this.refererFilter = value;
          break;

        default:
          break;
      }
    },
  },
  computed: {
    filteredRecords() {
      return this.records
        .filter((record) => {
          return record.patientName
            .toLowerCase()
            .includes(this.patientNameFilter);
        })
        .filter((record) => {
          return record.date.toLowerCase().includes(this.dateFilter);
        })
        .filter((record) => {
          return record.age.toLowerCase().includes(this.ageFilter);
        })
        .filter((record) => {
          return record.specimen.toLowerCase().includes(this.specimenFilter);
        })
        .filter((record) => {
          return record.referer.toLowerCase().includes(this.refererFilter);
        });
    },
    cssVars() {
      return {
        "--col1w": 42 + "px",
        "--col2w": this.clientWidth * 0.2 + "px",
        "--col3w": this.clientWidth * 0.1 + "px",
        "--col4w": this.clientWidth * 0.1 + "px",
        "--col5w": this.clientWidth * 0.2 + "px",
        "--col6w": this.clientWidth * 0.2 + "px",
        "--col7w": this.clientWidth * 0.05 + "px",
        "--col8w": this.clientWidth * 0.1 + "px",
      };
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
    };
  },
  beforeMount() {
    this.clientWidth = ipc.sendSync("get-width");
  },
  mounted() {
    this.records = recordsjson;
  },
};
</script>

<style lang="scss">
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
}
</style>
