<template>
    <h1 style="margin: 1rem; margin-bottom: 2.25rem">Past Reports</h1>
    <div class="id-search-container">
        <input
            class="id-search"
            type="text"
            placeholder="Filter patients by ID"
            v-model="search_id"
        />
    </div>
    <table :style="cssVars">
        <thead>
            <tr>
                <th>
                    <div>Patient Name</div>
                </th>
                <th>
                    <div>Date</div>
                </th>
                <th>
                    <div>Age</div>
                </th>
                <th>
                    <div>Specimen</div>
                </th>
                <th>
                    <div>Referer</div>
                </th>
                <th>
                    <div>Aspiration Note</div>
                </th>
                <th>
                    <div>Microscopic Examination</div>
                </th>
                <th>
                    <div>Impression</div>
                </th>
                <th />
            </tr>
        </thead>
        <tbody>
            <tr v-for="record in filteredRecords" :key="record._id">
                <recordRow v-bind="record" @delete="deleteRecord" />
                <router-link
                    :to="{ name: 'Report', params: { id: record._id } }"
                >
                    <button class="report-button">Report</button>
                </router-link>
            </tr>
        </tbody>
    </table>

    <button
        style="width: auto; margin: 1rem; padding: 0.25rem 1rem"
        @click="handleSelectAll"
    >
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
        cssVars() {
            return {
                "--col1w": this.clientWidth * 0.2 + "px",
                "--col2w": this.clientWidth * 0.1 + "px",
                "--col3w": this.clientWidth * 0.1 + "px",
                "--col4w": this.clientWidth * 0.2 + "px",
                "--col5w": this.clientWidth * 0.2 + "px",
                "--col6w": this.clientWidth * 0.2 + "px",
                "--col7w": this.clientWidth * 0.2 + "px",
                "--col8w": this.clientWidth * 0.2 + "px",
                "--col9w": this.clientWidth * 0.05 + "px",
                "--col10w": this.clientWidth * 0.05 + "px",
            };
        },
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

<style lang="scss" scoped>
table td,
table th {
    overflow: hidden;
}
table th:nth-of-type(1),
table td:nth-of-type(1) {
    width: var(--col1w);
}
table th:nth-of-type(2),
table td:nth-of-type(2) {
    width: var(--col2w);
}
table th:nth-of-type(3),
table td:nth-of-type(3) {
    width: var(--col3w);
}
table th:nth-of-type(4),
table td:nth-of-type(4) {
    width: var(--col4w);
}
table th:nth-of-type(5),
table td:nth-of-type(5) {
    width: var(--col5w);
}
table th:nth-of-type(6),
table td:nth-of-type(6) {
    width: var(--col6w);
}
table th:nth-of-type(7),
table td:nth-of-type(7) {
    width: var(--col7w);
}
table th:nth-of-type(8),
table td:nth-of-type(8) {
    width: var(--col8w);
}
table th:nth-of-type(9),
table td:nth-of-type(9) {
    width: var(--col9w);
}
table th:nth-of-type(10),
table td:nth-of-type(10) {
    width: var(--col10w);
}
table th:nth-of-type(11),
table td:nth-of-type(11) {
    width: var(--col11w);
}

table {
    max-width: 72rem;
    margin-top: 20px;
    border-top: 2px solid #c0c0c080;
    border-collapse: collapse;
    table-layout: fixed;
    width: calc(
        var(--col1w) + var(--col2w) + var(--col3w) + var(--col4w) + var(--col5w) +
            var(--col6w) + var(--col7w) + var(--col8w) + var(--col9w) +
            var(--col10w) + var(--col11w)
    );
}

.report-button {
    margin-top: 1.4rem;
}
</style>
