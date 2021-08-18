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
        <div><span class="left">ID No</span>: 00023</div>
        <div>Date: 29/05/2021 08:52 PM</div>
      </div>
      <div><span class="left">Name</span>: Mr. Shamsul Alam</div>
      <div class="box">
        <div><span class="left">Age</span>: 54 Years</div>
        <div>Gender: Male</div>
        <div>Contact No: 017827456293</div>
      </div>
      <div>
        <span class="left">Referred by</span>: (C1012) Mediaid Complex (PVT)
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
          <tr>
            <td>0031</td>
            <td>Urine R/M/E</td>
            <td class="right">250</td>
          </tr>
          <tr>
            <td>0151</td>
            <td>Bilirubin Serum</td>
            <td class="right">200</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td class="right">Sub total: <span class="spaced">450</span></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">Discount: <span class="spaced">0</span></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="right">Net payable: <span class="spaced">450</span></td>
          </tr>
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
    };
  },
  methods: {
    print() {
      window.print();
    },
  },
  beforeMount() {
    this.record = ipc.sendSync("get-record", this.$route.params.id);
  },
  // mounted() {
  //   this.print();
  // },
};
</script>

<style lang="scss" scoped>
.report {
  height: 210mm; /* DIN A4 standard paper size */
  width: 297mm;
}

.page {
  font-family: "Calibri";
  line-height: 2.5rem;

  margin: 0;
  /* you don't really have to explicitly set it to 0 unless it's already set to something else */
  header h1 {
    color: black;
    text-align: center;
    text-transform: uppercase;
    text-decoration: underline;
    font-size: 2.5rem;
    margin-bottom: 3rem;
  }

  font-size: 1.5rem;
}

.bold {
  font-weight: 800;
}

.left {
  display: inline-block;
  width: 8rem;
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
    margin: 1in 1in 1.2in 1in; /* printers usually have a bigger bottom margin*/
  }
}

@media print {
  div.page {
    margin: 10mm; /* Browser will apply the correct margins when it prints */
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
    font-size: 1.2rem;
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
