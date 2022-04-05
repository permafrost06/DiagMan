/* eslint-disable vue/no-v-for-template-key */
<template>
  <div>
    <select v-model="type">
      <option value="cyto" selected>Cytopathology</option>
      <option value="histo">Histopathology</option>
    </select>
    <button class="random-gen" v-if="debug" @click="randomGen()">
      Generate random patient
    </button>
    <br />
    <div class="flex">
      ID
      <input v-model="id" @keyup="checkID" />
      <okay-svg v-if="id && !idCollision" />
      <error-svg v-if="id && idCollision" />
      <button class="random-gen" v-if="debug" @click="randomGen('id')">
        O
      </button>
    </div>

    <br />
    Patient Name
    <input v-model="patientName" />
    <button class="random-gen" v-if="debug" @click="randomGen('name')">
      O
    </button>
    <br />
    Specimen Collection Date
    <input type="date" v-model="collDate" />
    <button class="random-gen" v-if="debug" @click="randomGen('collDate')">
      O
    </button>
    <br />
    Specimen Receiving Date
    <input type="date" v-model="date" />
    <button class="random-gen" v-if="debug" @click="randomGen('date')">
      O
    </button>
    <br />
    Age
    <input v-model="age" />
    <button class="random-gen" v-if="debug" @click="randomGen('age')">O</button>
    <br />
    Gender
    <select v-model="gender">
      <option value="" selected hidden>Choose gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
    <button class="random-gen" v-if="debug" @click="randomGen('gender')">
      O
    </button>
    <br />
    Contact No
    <input type="number" v-model="contactNo" />
    <button class="random-gen" v-if="debug" @click="randomGen('contact')">
      O
    </button>
    <br />
    Specimen
    <input v-model="specimen" />
    <button class="random-gen" v-if="debug" @click="randomGen('specimen')">
      O
    </button>
    <br />
    Referer
    <input list="doctors" v-model="referer" />
    <button class="random-gen" v-if="debug" @click="randomGen('referer')">
      O
    </button>
    <datalist id="doctors">
      <template v-for="doctor in doctorList" :key="doctor">
        <option :value="doctor" />
      </template>
    </datalist>
    <br />
    Delivery Date
    <input type="date" v-model="deliveryDate" />
    <button class="random-gen" v-if="debug" @click="randomGen('deliveryDate')">
      O
    </button>
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
    <button
      :disabled="idCollision || !filled"
      @click="addToStaged"
      style="width:8rem;"
    >
      Add
    </button>
    <router-link to="/">
      <button style="width:8rem;">Cancel</button>
    </router-link>
  </div>
</template>

<script>
import okaySvg from "../components/okay-svg.vue";
import errorSvg from "../components/error-svg.vue";
import testSelector from "../components/testSelector.vue";

import * as random from "../components/records.js";

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
      gender: "",
      contactNo: null,
      specimen: "",
      referer: "",
      tests: [],
      selectedTests: [],
      doctorList: [],
      deliveryDate: new Date(
        Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 6
      )
        .toISOString()
        .split("T")[0],
      discount: 0,
      advance: 0,
      debug: false,
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
    filled() {
      if (
        this.id &&
        this.patientName &&
        this.age &&
        this.gender &&
        this.contactNo &&
        this.specimen &&
        this.referer &&
        this.selectedTests.length
      )
        return true;
      else return false;
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
        discount: Number(this.discount),
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
    randomGen(field) {
      switch (field) {
        case "id":
          this.id = Math.random()
            .toString(36)
            .substr(2, 9);
          break;
        case "name":
          this.patientName = random.getRandomName();
          break;
        case "collDate":
          this.collDate = random.getRandomDate();
          break;
        case "date":
          this.date = random.getRandomDate();
          break;
        case "age":
          this.age = String(random.random(100));
          break;
        case "gender":
          this.gender = random.getRandomGender();
          break;
        case "contact":
          this.contactNo = random.getRandomContact();
          break;
        case "specimen":
          this.specimen = random.getRandomSpecimen();
          break;
        case "referer":
          this.referer = random.getRandomReferer();
          break;
        case "deliveryDate":
          this.deliveryDate = random.getRandomDate();
          break;

        default:
          this.id = Math.random()
            .toString(36)
            .substr(2, 9);
          this.patientName = random.getRandomName();
          this.collDate = random.getRandomDate();
          this.date = random.getRandomDate();
          this.age = String(random.random(100));
          this.gender = random.getRandomGender();
          this.contactNo = random.getRandomContact();
          this.specimen = random.getRandomSpecimen();
          this.referer = random.getRandomReferer();
          this.deliveryDate = random.getRandomDate();
          this.selectedTests = Array.from(
            new Set(
              [...Array(4)].map(
                () => ~~((Math.random() * 40) % this.filteredTests.length)
              )
            )
          ).map((x) => this.filteredTests[x]._id);
          this.discount = random.random(this.subtotal);
          break;
      }
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
    this.debug = ipc.sendSync("check-debug");
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

button.random-gen {
  width: auto;
  padding: 0.25rem 0.5rem;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
