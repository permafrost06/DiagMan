<template>
  <button class="sm-button" @click="print">Print</button>
  <router-link :to="{ name: 'Pending' }">
    <button class="sm-button">Go back</button>
  </router-link>
  <div class="report">
    <div class="page">
      <header>
        <div class="header-left">
          <p class="logo">The Opinion</p>
          <p><strong>Dr. Md. Saiful Islam</strong></p>
          <p>Cyto and Histopathology Specialist</p>
          <p>Associate Professor</p>
          <p>Department of Pathology</p>
          <p>Rangamati Medical College</p>
        </div>
        <div class="header-right">
          <p class="logo">দি অপিনিয়ন</p>
          <p><strong>ডা. মোঃ সাইফুল ইসলাম</strong></p>
          <p>সাইটো এবং হিস্টোপ্যাথলজি বিশেষজ্ঞ</p>
          <p>সহযোগী অধ্যাপক</p>
          <p>প্যাথলজি বিভাগ</p>
          <p>রাঙ্গামাটি মেডিকেল কলেজ</p>
        </div>
      </header>
      <h1>Invoice</h1>
      <div class="box bold">
        <div><span class="left">ID No</span>: {{ record._id }}</div>
      </div>
      <div>
        <span class="left">Patient Name</span>: {{ record.patientName }}
      </div>
      <div class="box">
        <div><span class="left">Age</span>: {{ record.age }}</div>
        <div>Contact No: {{ record.contactNo }}</div>
      </div>
      <div>
        <span class="left">Gender</span>:
        <p class="capital">{{ record.gender }}</p>
      </div>
      <div class="box">
        <div><span class="left">Specimen</span>: {{ record.specimen }}</div>
        <div>Collection Date: {{ dateRearr(record.collDate) }}</div>
      </div>
      <div><span class="left">Referred by</span>: {{ record.referer }}</div>
      <div class="gap-top bold">
        <span class="left">Receiving Date</span>: {{ dateRearr(record.date) }}
      </div>
      <div class="bold">
        <span class="left">Delivery Date</span>:
        {{ dateRearr(record.deliveryDate) }}
      </div>
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
              Sub total: <span class="spaced">{{ record.subtotal }}</span>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">
              Discount: <span class="spaced">{{ record.discount }}</span>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">
              Net Payable: <span class="spaced">{{ record.netPay }}</span>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">
              Advance: <span class="spaced">{{ record.advance }}</span>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">
              Due: <span class="spaced">{{ record.due }}</span>
            </td>
          </tr>
        </tfoot>
      </table>
      <footer>
        <p>125 KB Fazlul Kader Road, Chawkbazar</p>
        <p>Chattogram</p>
        <p>Mobile: 01883569391</p>
      </footer>
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
  },
  methods: {
    dateRearr(date) {
      const dateArr = date.split("-");
      return `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
    },
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
  height: 210mm;
  width: 297mm;
}

.page {
  font-family: "Calibri";
  line-height: 1.6rem;

  margin: 0;
  /* you don't really have to explicitly set it to 0 unless it's already set to something else */
  font-size: 1.25rem;
}

header {
  display: flex;
  justify-content: space-between;
}

.header-right {
  text-align: right;
  font-family: "SolaimanLipi";
}

h1 {
  margin-top: 1.5rem;
  color: black;
  text-align: center;
  text-transform: uppercase;
  text-decoration: underline;
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
}

.bold {
  font-weight: 800;
}

.left {
  display: inline-block;
  width: 9rem;
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
    margin: 10mm 2.5in 0 2.5in; /* Browser will apply the correct margins when it prints */
    // margin: 1in 1in 1.2in 1in; /* printers usually have a bigger bottom margin*/
  }
}

@media print {
  div.page {
    margin: 10mm 2.5in 0 2.5in; /* Browser will apply the correct margins when it prints */
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
  width: 3rem;
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
    width: 15rem;
  }

  .col-2 {
    width: 55rem;
  }

  .col-3 {
    width: 20rem;
  }
}

.gap-top {
  margin-top: 0.5rem;
}

.capital {
  display: inline-block;
  &::first-letter {
    text-transform: capitalize;
  }
}

footer {
  position: absolute;
  top: 60rem;
}

.logo {
  font-size: 1.8em;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
</style>
