<template>
    <h1 class="heading">Past Reports</h1>
    <router-link :to="{ name: 'Pending' }">
        <button class="secondary">Go To Patients</button>
    </router-link>
    <div class="filter-controls">
        <div>
            <label for="idFilterSelect">Filter patients by ID</label>
            <input
                class="id-search"
                id="idFilterSelect"
                type="text"
                placeholder="Filter patients by ID"
                v-model="search_id"
            />
        </div>
        <div>
            <label for="typeFilterSelect">Filter patients by type</label>
            <select v-model="typeFilter" id="typeFilterSelect">
                <option value="all" selected>All</option>
                <option value="cyto">Cytopathology</option>
                <option value="histo">Histopathology</option>
            </select>
        </div>
    </div>
    <table class="case-table">
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
                        :to="{ name: 'Report', params: { id: record._id } }"
                    >
                        <button>Report</button>
                    </router-link>
                    <router-link
                        :to="{
                            name: 'finalizeRecord',
                            params: { id: record._id },
                        }"
                    >
                        <button class="secondary">Edit report</button>
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
        updateData(ids) {
            var options = {};

            if (ids) {
                options = ids;
            }

            options.limit = null;

            const records = ipc.sendSync("get-records", options, {
                patientNameFilter: this.patientNameFilter,
                dateFilter: this.dateFilter,
                ageFilter: this.ageFilter,
                specimenFilter: this.specimenFilter,
                refererFilter: this.refererFilter,
                aspNoteFilter: this.aspNoteFilter,
                meFilter: this.meFilter,
                impressionFilter: this.impressionFilter,
            });
            records.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

            this.records = records;
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
            return this.records
                .filter((record) =>
                    record._id
                        .toLowerCase()
                        .includes(this.search_id.toLowerCase())
                )
                .filter(({ type }) => {
                    if (this.typeFilter === "all") return true;

                    if (type === this.typeFilter) return true;
                    else return false;
                });
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
            typeFilter: "all",
        };
    },
    beforeMount() {
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
