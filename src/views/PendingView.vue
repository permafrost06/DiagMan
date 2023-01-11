<template>
    <h1 class="heading">Pending Patients</h1>
    <router-link :to="{ name: 'AddRecord' }">
        <button :disabled="syncing">Add Patient</button>
    </router-link>
    <router-link :to="{ name: 'Records' }">
        <button class="secondary" :disabled="syncing">Go To Reports</button>
    </router-link>
    <button @click="startSync">Sync Now</button>
    <template v-if="syncing">Syncing. Please wait...</template>
    <div class="id-search-container">
        <input
            class="id-search"
            type="text"
            placeholder="Filter patients by ID"
            v-model="search_id"
        />
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
                    <div>Age</div>
                </th>
                <th class="col-4">
                    <div>Contact</div>
                </th>
                <th class="col-5">
                    <div>Specimen</div>
                </th>
                <th class="col-6">
                    <div>Referer</div>
                </th>
                <th class="col-8">
                    <div>Actions</div>
                </th>
                <th class="col-9" />
            </tr>
        </thead>
        <tbody>
            <tr v-for="record in filteredPatients" :key="record._id">
                <recordRow v-bind="record" @delete="deleteStaged">
                    <router-link
                        :to="{ name: 'Invoice', params: { id: record._id } }"
                    >
                        <button>Invoice</button>
                    </router-link>
                    <router-link
                        :to="{
                            name: 'finalizeRecord',
                            params: { id: record._id },
                        }"
                    >
                        <button>
                            Finalize
                        </button>
                    </router-link>
                </recordRow>
            </tr>
        </tbody>
    </table>
</template>

<script>
import recordRow from "../components/RecordRowComponent.vue";
import { connectedToInternet, checkFirestoreQuota } from "../firebase";

const ipc = window.ipcRenderer;
const log = require("electron-log");

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

            this.records = ipc.sendSync("get-staged", options, {
                patientNameFilter: this.patientNameFilter,
                dateFilter: this.dateFilter,
                ageFilter: this.ageFilter,
                specimenFilter: this.specimenFilter,
                refererFilter: this.refererFilter,
            });

            this.records.sort((patient_a, patient_b) => {
                patient_a._id
                    .toLowerCase()
                    .localeCompare(patient_b._id.toLowerCase());
            });
        },
        handleSelectAll() {
            const currentSelection = this.selectedRecords;
            this.selectedRecords = this.records.map((record) => record._id);
            this.exportRecords();
            this.selectedRecords = currentSelection;
        },
        exportRecords() {
            ipc.send("export", JSON.stringify(this.selectedRecords));
        },
        deleteStaged(data) {
            ipc.send("delete-staged", data);
        },
        async startSync() {
            try {
                await connectedToInternet();
                await checkFirestoreQuota();
                this.syncing = true;
                ipc.send("start-sync");
                log.info("patientsTable.vue: connection online, starting sync");
            } catch (e) {
                if (e.message === "No internet connection") {
                    log.warn(
                        "patientsTable.vue: connection offline, sync cancelled"
                    );
                }

                if (e.message === "Firestore quota reached") {
                    log.warn(
                        "patientsTable.vue: firestore quota reached, cannot sync"
                    );
                }

                this.syncing = false;
            }
        },
    },
    computed: {
        filteredPatients() {
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
            records: [],
            timer: null,
            syncing: false,
            search_id: "",
        };
    },
    beforeMount() {
        this.updateData();

        ipc.on("db-updated", () => {
            this.updateData();
        });

        ipc.on("sync-complete", () => {
            this.syncing = false;
            this.updateData();
        });

        ipc.on("sync-error", () => {
            this.syncing = false;
            log.error("patientsTable.vue: sync error!");
        });
    },
    mounted() {
        this.timer = setInterval(() => {
            this.startSync();
        }, 60 * 60 * 1000);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
};
</script>

<style>
.col-1 {
    width: 17vw;
}

.col-2 {
    width: 9vw;
}

.col-3 {
    width: 8vw;
}

.col-4 {
    width: 11vw;
}

.col-7 {
    width: 8vw;
}

.col-8 {
    width: 6vw;
}
</style>
