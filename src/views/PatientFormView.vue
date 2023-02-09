<!-- eslint-disable vue/no-v-model-argument -->
<template>
    <div class="form-container">
        <div>
            <select v-model="type">
                <option value="cyto" selected>Cytopathology</option>
                <option value="histo">Histopathology</option>
            </select>
            <button class="random-gen" v-if="debug" @click="randomGen()">
                Generate random patient
            </button>
        </div>
        <fieldset>
            <id-input
                v-model="id"
                v-model:collision="idCollision"
                :update="update"
            />
        </fieldset>

        <fieldset>
            <p>
                <label for="patient_name">Patient Name</label>
                <input id="patient_name" v-model="patientName" />
            </p>
            <p>
                <label for="age">Age</label>
                <input type="number" id="age" v-model="age" />
            </p>
            <p>
                <label for="gender">Gender</label>
                <select id="gender" v-model="gender">
                    <option value="" selected hidden>Choose gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </p>
            <p>
                <label for="contact">Contact No</label>
                <input
                    id="contact"
                    type="number"
                    placeholder="01XXXXXXXXX"
                    v-model="contactNo"
                />
            </p>
        </fieldset>

        <fieldset>
            <p>
                <label for="specimen">Specimen</label>
                <input id="specimen" v-model="specimen" />
            </p>
            <p>
                <label for="referer">Referer</label>
                <input id="referer" list="doctors" v-model="referer" />
            </p>
        </fieldset>

        <datalist id="doctors">
            <template v-for="doctor in doctorList" :key="doctor">
                <option :value="doctor" />
            </template>
        </datalist>

        <fieldset>
            <p>
                <label for="collection_date">Specimen Collection Date</label>
                <input id="collection_date" type="date" v-model="collDate" />
            </p>
            <p>
                <label for="receiving_date">Specimen Receiving Date</label>
                <input id="receiving_date" type="date" v-model="date" />
            </p>
            <p>
                <label for="delivery_date">Report Delivery Date</label>
                <input id="delivery_date" type="date" v-model="deliveryDate" />
            </p>
        </fieldset>

        <fieldset>
            <p>
                Tests:
                <TestSelector v-model="selectedTests" :type="type" />
            </p>
            <p>
                <label for="subtotal">Subtotal:</label>
                <input
                    type="number"
                    id="subtotal"
                    v-model="subtotal"
                    disabled
                />
            </p>
            <p>
                <label for="discount">Discount</label>
                <input id="discount" type="number" v-model="discount" />
            </p>
            <p>
                <label for="net_pay">Net Payable:</label>
                <input type="number" id="net_pay" v-model="netPay" disabled />
            </p>
            <p>
                <label for="advance">Advance paid</label>
                <input id="advance" type="number" v-model="advance" />
            </p>
            <p>
                <label for="due">Due:</label>
                <input type="number" id="due" v-model="due" disabled />
            </p>
        </fieldset>

        <div class="action-buttons-holder">
            <button
                v-if="update"
                :disabled="idCollision || !filled"
                @click="updatePatient"
            >
                Update Patient
            </button>
            <button
                v-else
                :disabled="idCollision || !filled"
                @click="addToStaged"
            >
                Add Patient
            </button>
            <router-link to="/">
                <button class="secondary">Cancel</button>
            </router-link>
        </div>
    </div>
</template>

<script>
import TestSelector from "../components/TestSelectorComponent.vue";
import idInput from "../components/IDInputComponent.vue";
import RandomGen from "../mixins/RandomGen";
import { getTimestamp } from "../firebase";

const ipc = window.ipcRenderer;

export default {
    components: {
        TestSelector,
        idInput,
    },
    mixins: [RandomGen],
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
                Date.now() +
                    1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 6
            )
                .toISOString()
                .split("T")[0],
            discount: 0,
            advance: 0,
            debug: false,
            update: false,
            report: {},
            notStaged: false,
        };
    },
    computed: {
        filteredTests() {
            return this.tests.filter(
                (test) => test.type.toLowerCase() == this.type
            );
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
                subtotal: this.subtotal,
                discount: Number(this.discount),
                netPay: this.netPay,
                advance: this.advance,
                due: this.due,
                timestamp: getTimestamp(),
            });
            this.$router.push({ name: "Pending" });
        },
        updatePatient(event) {
            event.preventDefault();
            if (this.notStaged) this.updateRecord();
            else this.updateStaged();
        },
        updateStaged() {
            ipc.send("update-staged", {
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
                subtotal: this.subtotal,
                discount: Number(this.discount),
                netPay: this.netPay,
                advance: this.advance,
                due: this.due,
            });
            this.$router.push({ name: "Pending" });
        },
        updateRecord() {
            ipc.send("record-update", {
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
                subtotal: this.subtotal,
                discount: Number(this.discount),
                netPay: this.netPay,
                advance: this.advance,
                due: this.due,
                aspNote: this.report.aspNote,
                me: this.report.me,
                impression: this.report.impression,
                note: this.report.note,
            });
            this.$router.push({ name: "Records" });
        },
        checkID() {
            ipc.send("check-id-collision", this.id, this.update);
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
        this.debug = ipc.sendSync("check-debug");
        if (this.$route.params.id) {
            this.update = true;
            let oldRecord = ipc.sendSync(
                "get-staged-rcd",
                this.$route.params.id
            );
            if (!oldRecord) {
                oldRecord = ipc.sendSync("get-record", this.$route.params.id);
                this.notStaged = true;
                this.report = {
                    aspNote: oldRecord.aspNote,
                    me: oldRecord.me,
                    impression: oldRecord.impression,
                    note: oldRecord.note,
                };
            }
            this.type = oldRecord.type;
            this.id = oldRecord._id;
            this.patientName = oldRecord.patientName;
            this.age = oldRecord.age.split(" ")[0];
            this.gender = oldRecord.gender;
            this.contactNo = oldRecord.contactNo;
            this.specimen = oldRecord.specimen;
            this.referer = oldRecord.referer;
            this.collDate = oldRecord.collDate;
            this.date = oldRecord.date;
            this.deliveryDate = oldRecord.deliveryDate;
            this.selectedTests = oldRecord.tests;
            this.discount = oldRecord.discount;
            this.advance = oldRecord.advance;
        }
    },
};
</script>

<style lang="scss">
.form-container {
    margin: 1rem auto;
    width: 45rem;
    font-size: 1.2rem;

    fieldset {
        border: 1px solid hsl(0, 0%, 73%);
        border-radius: 5px;
        padding: 0.25rem 0.5rem;
        margin: 0.5rem 0;
    }

    label {
        display: inline-block;
        width: 15rem;
    }

    input {
        width: 25rem;
        padding: 0.25rem 0.5rem;
    }

    input[type="date"],
    input[type="number"],
    input[type="file"] {
        width: auto;
    }

    input,
    select {
        font-size: 1rem;
        margin-right: 0.5rem;
    }

    select {
        padding: 0.25rem;
    }

    p {
        margin: 0.5rem 0;
    }
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
