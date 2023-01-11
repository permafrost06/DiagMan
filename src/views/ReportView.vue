<template>
    <button @click="print">Print</button>
    <router-link :to="{ name: 'Pending' }">
        <button class="secondary">Go back</button>
    </router-link>
    <div class="report">
        <div class="page">
            <header>
                <h1 v-if="record.type === 'histo'">Histopathology Report</h1>
                <h1 v-else>Cytopathology Report</h1>
            </header>
            <div class="box">
                <div>
                    <div class="bold">ID No: {{ record._id }}</div>
                    <div>Collected: {{ dateRearr(record.collDate) }}</div>
                    <div>Received: {{ dateRearr(record.date) }}</div>
                </div>
                <div class="right">
                    <div class="bold">Patient: {{ record.patientName }}</div>
                    <div>Age: {{ record.age }}</div>
                    <div>Gender: {{ record.gender }}</div>
                    <div>Contact No: {{ record.contactNo }}</div>
                </div>
            </div>
            <div class="reference">Referred by: {{ record.referer }}</div>
            <h3>Impression:</h3>
            <div v-html="record.impression"></div>
            <h3>Specimen</h3>
            {{ record.specimen }}
            <h3 v-if="record.type === 'histo'">Gross Examination:</h3>
            <h3 v-else>Aspiration Note:</h3>
            <div v-html="record.aspNote"></div>
            <h3>M/E:</h3>
            <div v-html="record.me"></div>
            <h3>Note:</h3>
            <div v-html="record.note"></div>
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
        dateRearr(date) {
            const dateArr = date.split("-");
            return `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
        },
        print() {
            window.print();
        },
    },
    beforeMount() {
        this.record = ipc.sendSync("get-record", this.$route.params.id);
    },
};
</script>

<style lang="scss">
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
        margin-top: 1.8in;
        font-size: 1.5rem;
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
</style>
