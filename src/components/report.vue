<template>
  <button class="sm-button" @click="print">Print</button>
  <button class="sm-button" @click="back">Go back</button>
  <div class="report">
    <div class="page">
      <header>
        <h1>Histopathology Report</h1>
      </header>
      <div class="box">
        <div>
          <div class="bold">ID No: {{ _id }}</div>
          <!-- <div>Collected: 01-01-2021</div>
          <div>Received: 01-01-2021</div> -->
          <div>Date: {{ date }}</div>
        </div>
        <div class="right">
          <div class="bold">Patient: {{ patientName }}</div>
          <div>Age: {{ age }}</div>
          <!-- <div>Sex: Female</div> -->
        </div>
      </div>
      <div class="reference">Referred by: {{ referer }}</div>
      <h3>Impression:</h3>
      {{ impression }}
      <h3>Specimen</h3>
      {{ specimen }}
      <h3>Aspiration Note:</h3>
      {{ aspNote }}
      <h3>M/E:</h3>
      {{ me }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    _id: String,
    patientName: String,
    date: String,
    age: String,
    specimen: String,
    referer: String,
    impression: String,
    aspNote: String,
    me: String,
  },
  methods: {
    print() {
      window.print();
    },
    back() {
      this.$emit("back");
    },
  },
  mounted() {
    this.print();
  },
};
</script>

<style lang="scss" scoped>
.report {
  height: 210mm; /* DIN A4 standard paper size */
  width: 297mm;
}

.page {
  font-family: "Times New Roman";

  margin: 0;
  /* you don't really have to explicitly set it to 0 unless it's already set to something else */
  header h1 {
    color: black;
    text-align: center;
    text-transform: uppercase;
    text-decoration: underline;
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  font-size: 1.2rem;
}

.bold {
  font-weight: 800;
}

.right {
  text-align: right;
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
</style>
