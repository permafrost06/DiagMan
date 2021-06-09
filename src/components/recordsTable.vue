<template>
  <table>
    <thead>
      <tableRow>
        <tableHeader>
          <input type="checkbox" class="check" />
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
        <recordRow v-bind="record" @record-updated="updateRecord" />
      </tableRow>
    </tbody>
  </table>
</template>

<script>
import tableRow from "./tableRow.vue";
import tableHeader from "./tableHeader.vue";
import categorySearch from "./categorySearch.vue";
import recordRow from "./recordRow.vue";

export default {
  name: "recordsTable",
  components: {
    tableHeader,
    categorySearch,
    tableRow,
    recordRow,
  },
  methods: {
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
  },
  data() {
    return {
      patientNameFilter: "",
      dateFilter: "",
      ageFilter: "",
      specimenFilter: "",
      refererFilter: "",
      records: [
        {
          id: "10001",
          patientName: "Ricky M. Goodwin",
          age: "55",
          specimen: "Left cervical lymph nodes",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10002",
          patientName: "Veronica D. Chatman",
          age: "48",
          specimen: "Thyroid",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10003",
          patientName: "Tammy J. Carr",
          age: "36",
          specimen: "Cervical Polyp",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10004",
          patientName: "Gregory E. Navarrete",
          age: "34",
          specimen: "Lump in right ankle",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10005",
          patientName: "Jenifer T. Koch",
          age: "71",
          specimen: "Uterus",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10006",
          patientName: "Steve B. Ayon",
          age: "44",
          specimen: "Tissue from epigastric port site",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10007",
          patientName: "Joshua J. Camacho",
          age: "64",
          specimen: "Left cervical lymph node",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10008",
          patientName: "Mary T. Woolbright",
          age: "73",
          specimen: "Fistula in ano",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10009",
          patientName: "Janis C. Butler",
          age: "34",
          specimen: "Thyroid mass",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10010",
          patientName: "Alvin A. Smith",
          age: "32",
          specimen: "Tissue from prostate",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10011",
          patientName: "Robert L. Marino",
          age: "42",
          specimen: "Left vocal cord polyp",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10012",
          patientName: "Michelle D. April",
          age: "80",
          specimen: "Fistula in ano",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
        {
          id: "10013",
          patientName: "Cathy J. Bolden",
          age: "54",
          specimen: "Endometrial curettage",
          date: "01/01/2020",
          referer: "Dr. John Doe, MBBS, FCPS",
        },
      ],
    };
  },
};
</script>

<style lang="scss">
:root {
  --col1w: 42px;
  --col2w: 250px;
  --col3w: 140px;
  --col4w: 110px;
  --col5w: 250px;
  --col6w: 220px;
  --col7w: 70px;
  --col8w: 140px;
}

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
