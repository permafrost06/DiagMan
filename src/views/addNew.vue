/* eslint-disable vue/no-v-for-template-key */
<template>
  <form>
    <select v-model="type">
      <option value="cyto" selected>Cytopathology</option>
      <option value="histo">Histopathology</option>
    </select>
    <br />
    <div class="flex">
      ID
      <input v-model="id" @keyup="checkID" />
      <okay-svg v-if="id && !idCollision" />
      <error-svg v-if="id && idCollision" />
    </div>

    <br />
    Patient Name
    <input v-model="patientName" />
    <br />
    Specimen Collection Date
    <input type="date" v-model="collDate" />
    <br />
    Specimen Receiving Date
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
    Delivery Date
    <input type="date" v-model="deliveryDate" />
    <br />
    Attach files
    <input type="file" multiple ref="fileEl" />
    <br />
    Tests:
    <testSelector
      :patientType="type"
      :tests="filteredTests"
      @updated="updateTestList"
      @tests-updated="updateTests"
    />
    <br />
    Subtotal: {{ subtotal }}
    <br />
    Discount
    <input type="number" v-model="discount" />
    <br />
    Net Payable: {{ netPay }}
    <br />
    Advance paid
    <input type="number" v-model="advance" />
    <br />
    Due: {{ due }}
    <br />
    <button :disabled="idCollision" @click="addToStaged" style="width:8rem;">
      Add
    </button>
    <router-link to="/">
      <button style="width:8rem;">Cancel</button>
    </router-link>
  </form>
</template>

<script>
import okaySvg from "../components/okay-svg.vue";
import errorSvg from "../components/error-svg.vue";
import testSelector from "../components/testSelector.vue";
const ipc = window.ipcRenderer;

export default {
  components: {
    okaySvg,
    errorSvg,
    testSelector,
  },
  data() {
    return {
      id: "",
      idCollision: false,
      type: "cyto",
      patientName: "",
      collDate: new Date().toISOString().split("T")[0],
      date: new Date().toISOString().split("T")[0],
      age: "",
      gender: "default",
      contactNo: null,
      specimen: "",
      referer: "",
      tests: [],
      testList: [],
      selectedTests: [],
      doctorList: [],
      deliveryDate: new Date(
        Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 6
      )
        .toISOString()
        .split("T")[0],
      discount: 0,
      advance: 0,
    };
  },
  computed: {
    filteredTests() {
      return this.tests.filter((test) => test.type.toLowerCase() == this.type);
    },
    subtotal() {
      let total = 0;
      for (let test in this.selectedTests) {
        const testid = this.selectedTests[test];
        const testObj = this.tests.filter((t) => t._id == testid);
        total += testObj[0].cost;
      }
      return total;
    },
    netPay() {
      return this.subtotal - this.discount;
    },
    due() {
      return this.netPay - this.advance;
    },
  },
  methods: {
    addToStaged(event) {
      const fileList = [];
      for (let i = 0; i < this.$refs.fileEl.files.length; i++) {
        fileList.push(this.$refs.fileEl.files[i].path);
      }
      event.preventDefault();
      ipc.send("add-staged", {
        _id: this.id,
        type: this.type,
        patientName: this.patientName,
        collDate: this.collDate,
        date: this.date,
        age: this.age,
        gender: this.gender,
        contactNo: this.contactNo,
        specimen: this.specimen,
        referer: this.referer,
        deliveryDate: this.deliveryDate,
        tests: JSON.stringify(this.selectedTests),
        files: JSON.stringify(fileList),
        subtotal: this.subtotal,
        discount: this.discount,
        netPay: this.netPay,
        advance: this.advance,
        due: this.due,
      });
      this.$router.push({ name: "Pending" });
    },
    checkID() {
      ipc.send("check-id-collision", this.id);
    },
    updateTestList(tests) {
      this.selectedTests = tests;
    },
    updateTests() {
      this.tests = ipc.sendSync("get-tests");
    },
  },
  beforeMount() {
    this.tests = ipc.sendSync("get-tests");
    this.doctorList = ipc.sendSync("get-referers");
    ipc.on("id-conflict", () => {
      this.idCollision = true;
    });
    ipc.on("id-safe", () => {
      this.idCollision = false;
    });
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  align-items: center;
}

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

button:disabled {
  color: gray;
  background: #0f3842;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
