<template>
    <h1 class="heading">Past Reports</h1>
    <router-link :to="{ name: 'Pending' }">
        <button class="secondary">Go To Patients</button>
    </router-link>
    <div class="id-search-container">
        <input
            class="id-search"
            type="text"
            placeholder="Filter patients by ID"
            v-model="search_id"
        />
    </div>
    <table>
        <thead>
            <tr>
                <th class="col-1">
                    <div>Patient Name</div>
                </th>
                <th class="col-2">
                    <div>Date</div>
                </th>
                <th class="col-3">
                    <div>Specimen</div>
                </th>
                <th class="col-4">
                    <div>Aspiration Note / Gross Examination</div>
                </th>
                <th class="col-5">
                    <div>Microscopic Examination</div>
                </th>
                <th class="col-6">
                    <div>Impression</div>
                </th>
                <th class="col-7">
                    <div>Actions</div>
                </th>
                <th class="col-8" />
            </tr>
        </thead>
        <tbody>
            <tr v-for="record in filteredRecords" :key="record._id">
                <recordRow v-bind="record" @delete="deleteRecord">
                    <router-link
                        :to="{
                            name: 'finalizeRecord',
                            params: { id: record._id },
                        }"
                    >
                        <button>Edit report</button>
                    </router-link>
                    <router-link
                        :to="{ name: 'Report', params: { id: record._id } }"
                    >
                        <button>Report</button>
                    </router-link>
                </recordRow>
            </tr>
        </tbody>
    </table>

    <button @click="handleSelectAll">
        Export all reports
    </button>
</template>

<script>
import recordRow from "../components/RecordRowComponent.vue";

const ipc = window.ipcRenderer;

export default {
    name: "recordsTable",
    components: {
        recordRow,
    },
    methods: {
        getWidth() {
            this.clientWidth = ipc.sendSync("get-width");
        },
        updateData(ids) {
            var options = {};

            if (ids) {
                options = ids;
            }

            options.limit = null;

            this.records = ipc.sendSync("get-records", options, {
                patientNameFilter: this.patientNameFilter,
                dateFilter: this.dateFilter,
                ageFilter: this.ageFilter,
                specimenFilter: this.specimenFilter,
                refererFilter: this.refererFilter,
                aspNoteFilter: this.aspNoteFilter,
                meFilter: this.meFilter,
                impressionFilter: this.impressionFilter,
            });

            this.records.sort((patient_a, patient_b) => {
                patient_a._id
                    .toLowerCase()
                    .localeCompare(patient_b._id.toLowerCase());
            });
        },
        deleteRecord(data) {
            ipc.send("delete-record", data);
        },
        exportRecords() {
            ipc.send("export", JSON.stringify(this.selectedRecords));
        },
    },
    computed: {
        filteredRecords() {
            return this.records.filter((record) =>
                record._id.toLowerCase().includes(this.search_id.toLowerCase())
            );
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
            aspNoteFilter: "",
            meFilter: "",
            impressionFilter: "",
            selectedRecords: [],
            records: [],
            search_id: "",
        };
    },
    beforeMount() {
        this.getWidth();
        ipc.on("resized", () => {
            this.getWidth();
        });

        this.updateData();

        ipc.on("db-updated", () => {
            this.updateData();
        });
    },
};
</script>

<style>
.col-1 {
    width: 12vw;
}

.col-2 {
    width: 8vw;
}

.col-3 {
    width: 14vw;
}

.col-4,
.col-5,
.col-6 {
    width: 16vw;
}

.col-7 {
    width: 8vw;
}

.col-8 {
    width: 8vw;
}
</style>
