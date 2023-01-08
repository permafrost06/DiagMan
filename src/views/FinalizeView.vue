<template>
    <form>
        <div class="row">
            <div class="row-left">
                <p>ID: {{ record._id }}</p>
                <p>
                    <span class="bold">Patient Name:</span>
                    {{ record.patientName }}
                </p>
                <p>
                    <span class="bold">Date Collected:</span>
                    {{ record.collDate }}
                </p>
                <p>
                    <span class="bold">Date Received:</span> {{ record.date }}
                </p>
                <p><span class="bold">Age:</span> {{ record.age }}</p>
                <p><span class="bold">Gender:</span> {{ record.gender }}</p>
                <p>
                    <span class="bold">Contact No:</span> {{ record.contactNo }}
                </p>
                <p><span class="bold">Referer:</span> {{ record.referer }}</p>
                <p><span class="bold">Specimen:</span> {{ record.specimen }}</p>
            </div>
            <div class="row-right">
                <h3>Templates</h3>
                <p>
                    <select v-model="organ" @change="clearTemp">
                        <option value="" selected hidden>Choose Organ</option>
                        <option
                            :value="organ._id"
                            v-for="organ in templates"
                            :key="organ._id"
                        >
                            {{ organ.organName }}
                        </option>
                    </select>
                    <input
                        type="text"
                        ref="newOrganField"
                        class="new-organ-field"
                        v-model="newOrganName"
                        @keydown.enter="addOrgan"
                    />
                    <button class="organ-button" @click="addOrgan">
                        Add Organ
                    </button>
                </p>
                <p>
                    <select v-if="organ" @change="template">
                        <option value="" selected hidden>
                            Choose Template
                        </option>
                        <optgroup
                            v-for="organ in filteredTemps"
                            :key="organ._id"
                            :label="organ.organName"
                        >
                            <option
                                value=""
                                disabled
                                v-if="!organ.templates.length"
                            >
                                There are no templates for this organ
                            </option>
                            <option
                                :value="template._id"
                                v-for="template in organ.templates"
                                :key="template._id"
                            >
                                {{ template.name }}
                            </option>
                        </optgroup>
                    </select>
                    <br />
                    <input
                        type="text"
                        ref="newTemplateField"
                        v-model="newTemplateName"
                        class="new-organ-field new-template"
                        @keydown.enter="addTemplate"
                    />
                    <button
                        class="organ-button"
                        @click="addTemplate"
                        v-if="organ"
                    >
                        {{ saveButtonText }}
                    </button>
                    <button
                        class="organ-button"
                        @click="updateTemplate"
                        v-if="templateID"
                    >
                        Update Template
                    </button>
                    <button
                        class="organ-button"
                        @click="deleteTemplate"
                        v-if="templateID"
                    >
                        Delete Template
                    </button>
                </p>
            </div>
        </div>
        <p>
            <span v-if="record.type == 'cyto'" class="bold"
                >Aspiration Note</span
            >
            <span v-if="record.type == 'histo'" class="bold"
                >Gross Examination</span
            >
            <editor v-model="aspNote" />
        </p>
        <p>
            <span class="bold">Microscopic Examination</span>
            <editor v-model="me" />
        </p>
        <p>
            <span class="bold">Impression</span>
            <editor v-model="impression" />
        </p>
        <p>
            <span class="bold">Note</span>
            <editor v-model="note" />
        </p>
        <p>
            <input
                :disabled="debug || update"
                type="checkbox"
                id="sms"
                v-model="sms"
            />
            <label for="sms">Send SMS</label>
        </p>
        <p>SMS Remaining: {{ smsStatus.balance / 0.43 }}</p>
        <p>Expires on: {{ dateRearr(smsStatus.expiry.split("T")[0]) }}</p>
        <button :disabled="!filled" @click="addRecord" style="width: 8rem">
            <template v-if="update">Update</template>
            <template v-else>Add</template>
        </button>
        <router-link :to="{ name: 'Pending' }">
            <button style="width: 8rem">Cancel</button>
        </router-link>
    </form>
</template>

<script>
import editor from "../components/EditorComponent.vue";
const ipc = window.ipcRenderer;

export default {
    components: {
        editor,
    },

    data() {
        return {
            aspNote: "",
            me: "",
            impression: "",
            note: "",
            record: {},
            organ: "",
            templates: [],
            currentTemp: {},
            newOrganName: "",
            newTemplateName: "",
            templateID: "",
            saveButtonText: "Save Template As",
            sms: true,
            debug: false,
            smsStatus: {
                balance: 0,
                expiry: "0-0-0T",
            },
            update: false,
        };
    },
    computed: {
        filteredTemps() {
            return this.templates.filter((organ) => organ._id == this.organ);
        },
        filled() {
            if (this.aspNote && this.me && this.impression) return true;
            else return false;
        },
    },
    methods: {
        dateRearr(date) {
            const dateArr = date.split("-");
            return `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
        },
        template(event) {
            this.templateID = event.target.value;
            let template = this.templates
                .filter((organ) => organ._id == this.organ)[0]
                .templates.filter((temp) => temp._id == this.templateID)[0];
            this.currentTemp = template;
            this.aspNote = template.aspNote;
            this.me = template.me;
            this.impression = template.impression;
        },
        clearTemp() {
            this.templateID = "";
        },
        addRecord(event) {
            event.preventDefault();
            const ipcMsg = this.update ? "record-update" : "add-record";
            ipc.send(ipcMsg, {
                _id: this.record._id,
                type: this.record.type,
                collDate: this.record.collDate,
                date: this.record.date,
                patientName: this.record.patientName,
                age: this.record.age,
                gender: this.record.gender,
                contactNo: this.record.contactNo,
                referer: this.record.referer,
                deliveryDate: this.record.deliveryDate,
                specimen: this.record.specimen,
                tests: JSON.stringify(this.record.tests),
                files: JSON.stringify(this.record.files),
                discount: Number(this.record.discount),
                aspNote: this.aspNote,
                me: this.me,
                impression: this.impression,
                note: this.note,
            });
            if (this.sms) ipc.send("send-sms", this.record.contactNo);
            this.$router.push({
                name: "Report",
                params: { id: this.record._id },
            });
        },
        addOrgan(event) {
            event.preventDefault();
            if (this.newOrganName == "") {
                this.$refs.newOrganField.style.display = "inline-block";
                this.$refs.newOrganField.focus();
            } else {
                ipc.send("add-organ", this.newOrganName);
                this.$refs.newOrganField.style.display = "none";
                this.newOrganName = "";
                this.templates = ipc.sendSync("get-templates");
            }
        },
        addTemplate(event) {
            event.preventDefault();
            if (this.newTemplateName == "") {
                this.$refs.newTemplateField.style.display = "block";
                this.saveButtonText = "Save Template";
                this.newTemplateName = this.impression;
                this.$refs.newTemplateField.focus();
            } else {
                ipc.send("add-template", this.organ, {
                    name: this.newTemplateName,
                    aspNote: this.aspNote,
                    me: this.me,
                    impression: this.impression,
                });
                this.$refs.newTemplateField.style.display = "none";
                this.newTemplateName = "";
                this.templates = ipc.sendSync("get-templates");
                this.saveButtonText = "Save Template As";
            }
        },
        updateTemplate(event) {
            event.preventDefault();
            ipc.send("update-template", this.organ, {
                _id: this.templateID,
                name: this.currentTemp.name,
                aspNote: this.aspNote,
                me: this.me,
                impression: this.impression,
            });
        },
        deleteTemplate(event) {
            event.preventDefault();
            ipc.send("delete-template", this.organ, this.templateID);
            this.clearTemp();
        },
        syncTemplates() {
            this.templates = ipc.sendSync("get-templates");
        },
    },
    beforeMount() {
        const record = ipc.sendSync("get-record", this.$route.params.id);
        if (record) {
            this.update = true;
            this.record = record;
            this.aspNote = record.aspNote;
            this.me = record.me;
            this.impression = record.impression;
            this.note = record.note;
        } else {
            this.record = ipc.sendSync("get-staged-rcd", this.$route.params.id);
        }
        this.syncTemplates();

        ipc.on("db-updated", () => {
            this.syncTemplates();
        });
        this.debug = ipc.sendSync("check-debug");
        this.smsStatus = ipc.sendSync("get-sms-balance");
    },
    updated() {
        if (this.debug) this.sms = false;
    },
};
</script>

<style lang="scss" scoped>
textarea {
    font-family: "Ubuntu";
    width: 50vw;
    height: 10ch;
    width: 100%;
    border: 1px solid #c4c4c4;
    border-radius: 4px;
    padding-left: 0.5rem;
}

* {
    margin: 0.5rem 0.25rem;
}

.row {
    display: flex;
}

.row-left {
    width: 40vw;
}

.organ-button {
    display: inline-block;
    width: auto;
    padding: 0 0.5rem;
}

.new-organ-field {
    display: none;
    width: 10rem;
}

.new-template {
    width: 25rem;
}

button:disabled {
    color: gray;
    background: #0f3842;
}
</style>
