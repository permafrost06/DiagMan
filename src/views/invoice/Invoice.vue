<template>
  <button class="sm-button" @click="print">Print</button>
  <router-link :to="{ name: 'Pending' }">
    <button class="sm-button">Go back</button>
  </router-link>
  <div class="report">
    <div class="page">
      <header>
        <h1>Invoice</h1>
      </header>
      <div>Money Receipt</div>
      <div class="box bold">
        <div><span class="left">ID No</span>: {{ record._id }}</div>
        <div>Date: {{ record.date }}</div>
      </div>
      <div><span class="left">Name</span>: {{ record.patientName }}</div>
      <div class="box">
        <div><span class="left">Age</span>: {{ record.age }}</div>
        <div>Contact No: {{ record.contactNo }}</div>
      </div>
      <div><span class="left">Gender</span>: {{ record.gender }}</div>
      <div><span class="left">Referred by</span>: {{ record.referer }}</div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="col-1">Code</th>
            <th class="col-2">Test Name</th>
            <th class="col-3 right">Price (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="test in tests" :key="test._id">
            <td>{{ test._id }}</td>
            <td>{{ test.name }}</td>
            <td class="right">{{ test.cost }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td class="right">
              Sub total: <span class="spaced">{{ testTotalCost }}</span>
            </td>
          </tr>
          <!-- <tr>
            <td></td>
            <td></td>
            <td class="right">Discount: <span class="spaced">0</span></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">Net payable: <span class="spaced">450</span></td>
          </tr> -->
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  data() {
    return {
      record: {},
      allTests: [],
    };
  },
  computed: {
    tests() {
      return this.allTests.filter(
        (test) => this.record.tests.indexOf(test._id) >= 0
      );
    },
    testTotalCost() {
      var total = 0;

      this.tests.forEach((test) => {
        total += test.cost;
      });

      return total;
    },
  },
  methods: {
    print() {
      window.print();
    },
  },
  beforeMount() {
    this.record = ipc.sendSync("get-staged-rcd", this.$route.params.id);
    this.allTests = ipc.sendSync("get-tests");
  },
  // mounted() {
  //   this.print();
  // },
};
</script>

<style lang="scss" scoped>
.report {
  height: 145mm;
  // width: 100mm;
  // height: 210mm; /* DIN A4 standard paper size */
  width: 297mm;
}

.page {
  font-family: "Calibri";
  line-height: 1.2rem;

  margin: 0;
  /* you don't really have to explicitly set it to 0 unless it's already set to something else */
  header h1 {
    color: black;
    text-align: center;
    text-transform: uppercase;
    text-decoration: underline;
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  font-size: 1rem;
}

.bold {
  font-weight: 800;
}

.left {
  display: inline-block;
  width: 5rem;
}

.right {
  text-align: right;
}

.box {
  display: flex;
  justify-content: space-between;
}

@media screen {
  div.page {
    margin: 10mm 3in 0 3in; /* Browser will apply the correct margins when it prints */
    // margin: 1in 1in 1.2in 1in; /* printers usually have a bigger bottom margin*/
  }
}

@media print {
  div.page {
    margin: 10mm 3in 0 3in; /* Browser will apply the correct margins when it prints */
    // margin-top: 1.8in;
  }

  button {
    display: none;
  }

  #nav {
    display: none;
  }
}

.box {
  display: flex;
  justify-content: space-between;
}

.reference {
  margin-top: 1rem;
  border-bottom: 1px solid black;
}

h3 {
  font-weight: 800;
  margin: 0;
  margin-top: 1.5rem;
}

.spaced {
  display: inline-block;
  width: 5rem;
}

.invoice-table {
  margin-top: 2rem;

  border-collapse: collapse;

  thead th {
    border-bottom: 1px solid black;
  }

  tfoot tr:first-of-type td {
    border-top: 1px solid black;
  }

  th {
    font-size: 1rem;
    font-weight: 800;
    text-align: left;
  }

  th.right {
    text-align: right;
  }

  th div {
    margin-bottom: 0.5rem;
  }

  .col-1 {
    width: 5rem;
  }

  .col-2 {
    width: 55rem;
  }

  .col-3 {
    width: 20rem;
  }
}
</style>
