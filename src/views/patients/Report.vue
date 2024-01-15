<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import Icon from "@/components/base/Icon.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
import SimpleInput from "@/components/form/SimpleInput.vue";
import ReportTemplateFormModal from "@/components/view/ReportTemplateFormModal.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Quill, { type QuillOptionsStatic } from "quill";

import "quill/dist/quill.snow.css";
import { dateToDMY } from "@/helpers/utils";
import EditPatient from "./EditPatient.vue";
import { useUser } from "@/stores/user";
import router from "@/router";

const quillOptions: QuillOptionsStatic = {
    debug: "error",
    modules: {
        toolbar: [
            { header: [1, 2, 3, 4, 5, 6, false] },
            "bold",
            "italic",
            "underline",
            "strike",
        ],
    },
    theme: "snow",
};

const quillInstances: any = {};
const route = useRoute();
const user = useUser();

const editMode = ref(false);

const organs = ref<Record<string, any>[]>([]);
const templates = ref<Record<string, any>[]>([]);
const isLoadingOrgans = ref<boolean>(true);
const isLoadingTemplates = ref<boolean>(false);
const templatePaneOpen = ref<boolean>(false);

const patient = ref<Record<string, any>>();
const isLoading = ref<boolean>(false);
const isPosting = ref<"add" | "draft" | boolean>(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);

const diagField = ref<HTMLDivElement>();
const indicationField = ref<HTMLDivElement>();
const microField = ref<HTMLDivElement>();
const srcField = ref<HTMLDivElement>();
const grossField = ref<HTMLDivElement>();
const clinicField = ref<HTMLDivElement>();
const aspField = ref<HTMLDivElement>();

const noteField = ref<HTMLDivElement>();
const noteFieldVisible = ref<boolean>(false);

const templateModalValue = ref<Record<string, any> | false>(false);

const errors = ref<Record<string, string | undefined>>({});

onMounted(async () => {
    initEditors();
    loadOrgans();
    loadTemplates();

    const id = route.params.id;
    isLoading.value = true;
    const res = await fetchApi(API_BASE + `/reports/${id}`);
    if (res.success) {
        patient.value = res.rows[0];
        const p = res.rows[0];
        setEditorContent(p);
        noteFieldVisible.value = quillInstances.note.getLength() > 1;
        reCheckEditors();
    }
    isLoading.value = false;
});

watch(noteFieldVisible, async () => {
    await nextTick();
    if (noteFieldVisible.value) {
        if (patient.value?.note) {
            console.log(patient.value.note);
            quillInstances.note.setContents(
                JSON.parse(patient.value.note || "{}").ops
            );
        }
    }
});

function setEditorContent(res: any) {
    for (const fName in quillInstances) {
        try {
            const delta = JSON.parse(res[fName] || "{}");
            quillInstances[fName].setContents(delta.ops);
        } catch (_e) {
            quillInstances[fName].setContents([]);
        }
    }
}

async function initEditors() {
    quillInstances.diagnosis = new Quill(diagField.value!, quillOptions);
    quillInstances.indication = new Quill(indicationField.value!, quillOptions);
    quillInstances.microscopic_description = new Quill(
        microField.value!,
        quillOptions
    );
    quillInstances.anatomical_source = new Quill(srcField.value!, quillOptions);
    quillInstances.gross_description = new Quill(
        grossField.value!,
        quillOptions
    );
    quillInstances.clinical_info = new Quill(clinicField.value!, quillOptions);
    quillInstances.asp_note = new Quill(aspField.value!, quillOptions);

    quillInstances.note = new Quill(noteField.value!, quillOptions);
}

async function loadOrgans() {
    const res = await fetchApi(API_BASE + "/settings/report-templates/organs");
    isLoadingOrgans.value = false;
    if (!res.success) {
        console.error(res.message || "Failed to load organs!");
        return;
    }
    organs.value = res.rows;
}

let temAbort = new AbortController();
async function loadTemplates(organ: string = "") {
    if (isLoadingTemplates.value) {
        temAbort.abort();
        temAbort = new AbortController();
    }
    isLoadingTemplates.value = true;
    const res = await fetchApi(
        API_BASE +
            `/settings/report-templates?${
                organ ? "organ=" + encodeURIComponent(organ) : ""
            }`,
        {
            signal: temAbort?.signal,
        }
    );
    isLoadingTemplates.value = false;
    if (!res.success) {
        console.error(res.message || "Failed to load templates!");
        return;
    }
    templates.value = res.rows;
}

function reCheckEditors() {
    if (patient.value?.locked) {
        for (const i in quillInstances) {
            quillInstances[i].disable();
        }
        return;
    }
    for (const i in quillInstances) {
        quillInstances[i].enable();
    }
}

const handleFormSubmit = async (evt: any) => {
    if (isPosting.value || !patient.value?.id) {
        return;
    }
    isPosting.value = true;

    const data = new FormData(evt.target);

    errors.value = {};
    error.value = null;
    message.value = null;

    for (const fName in quillInstances) {
        data.append(fName, JSON.stringify(quillInstances[fName].getContents()));
    }

    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: data,
    });
    isPosting.value = false;
    if (res.success) {
        error.value = null;
        message.value = res.message!;
        patient.value.locked = res.rows[0].locked;
        // reCheckEditors();
        router.back();
    } else {
        error.value = res.message;
        errors.value = res.field as any;
    }
};

const onPatientUpdate = (_row: any, msg: string) => {
    editMode.value = false;
    message.value = msg;
};

const onTemplateChange = (evt: any) => {
    const template = templates.value[evt.target.value];
    if (!template) {
        return;
    }
    setEditorContent(template);
    noteFieldVisible.value = quillInstances.note.getLength() > 1;
};

const showTemplateSaver = () => {
    const newTemplate: any = {};
    for (const fName in quillInstances) {
        newTemplate[fName] = JSON.stringify(
            quillInstances[fName].getContents()
        );
    }
    newTemplate["type"] = patient.value?.type === "cyto" ? "cyto" : "histo";
    templateModalValue.value = newTemplate;
};

const onTemAdded = (tem: any) => {
    templates.value.push(tem);
    templateModalValue.value = false;
};

const isUnLocking = ref<boolean>(false);
const toggleLock = async () => {
    if (isUnLocking.value || !patient.value) {
        return;
    }
    isUnLocking.value = true;

    const res = await fetchApi(API_BASE + "/reports/lock/" + patient.value.id, {
        method: "POST",
    });
    isUnLocking.value = false;
    if (!res.success) {
        console.error(res.message || "Toggling report lock failed!");
        return;
    }
    patient.value.locked = !patient.value.locked;
    reCheckEditors();
};
</script>
<template>
    <div class="report-page">
        <h1 class="fs-2xl bold">Add Report</h1>
        <RouterLink :to="{ name: 'home' }" class="home-url">
            <Icon size="40" view-box="36">
                <path
                    fill="currentColor"
                    d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                    class="clr-i-outline clr-i-outline-path-1"
                />
                <path fill="none" d="M0 0h36v36H0z" />
            </Icon>
        </RouterLink>

        <form
            :action="API_BASE + '/reports'"
            method="POST"
            @submit.prevent="handleFormSubmit"
            class="grid"
        >
            <div class="left" v-if="!editMode">
                <div class="flex-grow" v-if="patient">
                    <div class="patient-info fs-md">
                        <div class="id-area">
                            <p>Patient ID:</p>
                            <p class="bold">{{ patient.id }}</p>
                        </div>
                        <button @click="editMode = true">Edit Patient</button>

                        <p>Type</p>
                        <p class="capitalize">{{ patient.type }}pathology</p>

                        <p>Name</p>
                        <p>{{ patient.name }}</p>

                        <p>Age</p>
                        <p>{{ patient.age }}</p>

                        <p>Gender</p>
                        <p class="capitalize">{{ patient.gender }}</p>

                        <p>Contact</p>
                        <p>{{ patient.contact }}</p>

                        <p>Referer</p>
                        <p>{{ patient.referer }}</p>

                        <p>Specimen</p>
                        <p class="bold">{{ patient.specimen }}</p>

                        <p>Specimen collection date</p>
                        <p>
                            {{
                                dateToDMY(
                                    new Date(
                                        parseInt(patient.sample_collection_date)
                                    )
                                )
                            }}
                        </p>

                        <p>Specimen receiving date</p>
                        <p>
                            {{
                                dateToDMY(
                                    new Date(parseInt(patient.entry_date))
                                )
                            }}
                        </p>

                        <p>Tests</p>
                        <p class="bold">{{ patient.test_names }}</p>

                        <p>Report delivery date</p>
                        <p>
                            {{
                                dateToDMY(
                                    new Date(parseInt(patient.delivery_date))
                                )
                            }}
                        </p>
                    </div>
                </div>
                <div v-else-if="isLoading" class="flex justify-center">
                    <Loading size="60" />
                </div>
                <div v-else>
                    <p class="form-alert error">This patient id is invalid!</p>
                </div>
                <div class="submit-area">
                    <CheckBox
                        v-if="!patient?.locked"
                        label="Lock Report"
                        name="locked"
                        value="1"
                        :checked="patient?.locked"
                    />
                    <div class="flex gap-sm mt-sm">
                        <button type="submit">
                            <Loading
                                v-if="isPosting === true || isPosting === 'add'"
                            />
                            Add Report
                        </button>
                        <button
                            type="button"
                            class="btn-outline"
                            v-if="patient?.locked && user.isAdmin"
                            @click="toggleLock"
                        >
                            <Loading v-if="isUnLocking" />
                            Unlock
                        </button>
                        <RouterLink
                            class="btn btn-outline"
                            :to="{ name: 'report.print' }"
                        >
                            Print Report
                        </RouterLink>
                        <button
                            type="button"
                            class="btn-outline"
                            @click="showTemplateSaver"
                        >
                            Save As Template
                        </button>
                    </div>
                </div>
            </div>
            <EditPatient
                v-else
                :headless="true"
                :on-success="onPatientUpdate"
                style="
                    padding-right: 0.5rem;
                    border-right: 1px solid var(--clr-black);
                "
            />
            <div class="right">
                <p class="form-alert error" v-if="error">{{ error }}</p>
                <p class="form-alert success" v-if="message">{{ message }}</p>

                <input type="hidden" name="id" :value="patient?.id" />
                <div :class="['template-selector', { open: templatePaneOpen }]">
                    <div
                        class="opener"
                        @click="templatePaneOpen = !templatePaneOpen"
                    >
                        <h3>
                            {{ templatePaneOpen ? "Close" : "Templates" }}
                        </h3>
                    </div>
                    <h2>Template</h2>
                    <div class="tem-sel-inputs">
                        <SimpleSelect
                            label="Organ"
                            :un-wrap="true"
                            @input="(evt) => loadTemplates(evt.target.value)"
                        >
                            <option value="">
                                {{
                                    isLoadingTemplates
                                        ? "Please wait..."
                                        : "All"
                                }}
                            </option>
                            <option
                                v-for="item in organs"
                                :key="item.organ"
                                :value="item.organ"
                            >
                                {{ item.organ }}
                            </option>
                        </SimpleSelect>
                        <SimpleSelect
                            label="Template"
                            :un-wrap="true"
                            @input="onTemplateChange"
                        >
                            <option value="">
                                {{
                                    isLoadingTemplates
                                        ? "Loading..."
                                        : "Select Template"
                                }}
                            </option>
                            <option
                                v-for="(item, idx) in templates"
                                :key="item.id"
                                :value="idx"
                            >
                                {{ item.name }}
                            </option>
                        </SimpleSelect>
                    </div>
                </div>
                <div class="editor-unit">
                    <label>Diagnosis</label>
                    <div ref="diagField"></div>
                    <p v-if="errors.diagnosis" class="hint error">
                        {{ errors.diagnosis }}
                    </p>
                </div>

                <div class="editor-unit">
                    <label>Indication</label>
                    <div ref="indicationField"></div>
                    <p v-if="errors.indication" class="hint error">
                        {{ errors.indication }}
                    </p>
                </div>

                <div class="editor-unit">
                    <label>Microscopic Description</label>
                    <div ref="microField"></div>
                    <p v-if="errors.microscopic_description" class="hint error">
                        {{ errors.microscopic_description }}
                    </p>
                </div>

                <div :class="{ hidden: patient?.type !== 'cyto' }">
                    <div class="editor-unit">
                        <label>Clinical Info</label>
                        <div ref="clinicField"></div>
                        <p v-if="errors.clinical_info" class="hint error">
                            {{ errors.clinical_info }}
                        </p>
                    </div>
                    <div class="editor-unit">
                        <label>Aspiration Note</label>
                        <div ref="aspField"></div>
                        <p v-if="errors.asp_note" class="hint error">
                            {{ errors.asp_note }}
                        </p>
                    </div>
                    <div class="text-inputs">
                        <SimpleInput
                            :un-wrap="true"
                            label="No of sections embedded:"
                            name="embedded_sections"
                            :value="patient?.embedded_sections"
                            :hint="errors.embedded_sections"
                        />
                        <SimpleInput
                            :un-wrap="true"
                            label="No of paraffin blocks:"
                            name="paraffin_blocks"
                            :value="patient?.paraffin_blocks"
                            :hint="errors.paraffin_blocks"
                        />
                    </div>
                </div>
                <div :class="{ hidden: patient?.type === 'cyto' }">
                    <div class="editor-unit">
                        <label>Anatomical Source</label>
                        <div ref="srcField"></div>
                        <p v-if="errors.anatomical_source" class="hint error">
                            {{ errors.anatomical_source }}
                        </p>
                    </div>
                    <div class="editor-unit">
                        <label>Gross Description</label>
                        <div ref="grossField"></div>
                        <p v-if="errors.gross_description" class="hint error">
                            {{ errors.gross_description }}
                        </p>
                    </div>
                    <div class="text-inputs">
                        <SimpleInput
                            :un-wrap="true"
                            label="No of slides made:"
                            name="slides_made"
                            :value="patient?.slides_made"
                            :hint="errors.slides_made"
                        />
                        <SimpleInput
                            :un-wrap="true"
                            label="No of slides stained:"
                            name="slides_stained"
                            :value="patient?.slides_stained"
                            :hint="errors.slides_stained"
                        />
                    </div>
                </div>
                <div class="editor-unit" :class="{ hidden: !noteFieldVisible }">
                    <label>Note</label>
                    <div ref="noteField"></div>
                </div>
                <div
                    class="justify-end"
                    :class="{
                        hidden: noteFieldVisible,
                        flex: !noteFieldVisible,
                    }"
                >
                    <button
                        type="button"
                        class="btn-outline"
                        @click="noteFieldVisible = true"
                    >
                        + Add Note
                    </button>
                </div>
            </div>
            <div class="submit-area-2" v-if="editMode">
                <CheckBox
                    v-if="!patient?.locked"
                    label="Lock Report"
                    name="locked"
                    value="1"
                    :checked="patient?.locked"
                />
                <div class="flex gap-sm mt-sm">
                    <button type="submit">
                        <Loading
                            v-if="isPosting === true || isPosting === 'add'"
                        />
                        Add Report
                    </button>
                </div>
            </div>
        </form>
    </div>
    <ReportTemplateFormModal
        v-if="templateModalValue"
        :edit="templateModalValue"
        :on-close="() => (templateModalValue = false)"
        :on-added="onTemAdded"
    />
</template>
<style lang="scss">
.report-page {
    margin: 30px;

    form {
        margin-top: 30px;

        &.grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
    }

    .left {
        border-right: 1px solid var(--clr-black);
        position: relative;
        padding-right: 10px;
        display: flex;
        flex-flow: column;

        .patient-info {
            display: grid;
            grid-template-columns: auto auto;
            grid-template-rows: min-content;
            gap: 10px;
            padding-bottom: 20px;

            p {
                margin-top: 10px;

                &:first-child,
                &:nth-child(2) {
                    margin-top: 0;
                }
            }

            .id-area {
                display: flex;
                align-items: center;
                gap: 5px;
            }

            button {
                background: transparent;
                padding: 0;
                color: inherit;
                text-decoration: underline;
                font-size: var(--fs-md);
                display: block;
                text-align: left;
            }
        }

        .submit-area {
            background: var(--clr-white);
        }
    }

    .right {
        .text-inputs {
            display: grid;
            grid-template-columns: max-content auto;
            gap: 10px;
            margin-bottom: 10px;
        }
        .editor-unit {
            margin-bottom: 20px;

            label {
                font-weight: 500;
            }

            .ql-container {
                height: 120px;
                overflow-y: auto;

                & > .ql-editor {
                    height: 100%;
                }
            }
        }

        .form-alert {
            margin-bottom: 20px;
        }

        .submit-area-2 {
            padding: 20px 0;
        }

        .editor-n-template-grid {
            display: grid;
            grid-template-columns: 1fr max-content;
            gap: 10px;
        }
    }

    .template-selector {
        position: fixed;
        width: 30rem;
        background-color: white;
        z-index: 999;
        padding: 2rem;
        padding-left: 4rem;
        right: 0;
        transform: translateX(93%);
        border: 1px solid black;

        h2 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: var(--fs-lg);
        }

        .tem-sel-inputs {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 10px;
        }

        .opener {
            height: 1.5rem;
            width: 11.5rem;
            text-align: center;
            position: absolute;
            left: 0;
            top: 0;
            transform-origin: 0 0;
            rotate: -90deg;
            transform: translate(-100%, 20%);
            cursor: pointer;
        }
    }

    .template-selector.open {
        transform: translateX(0);
    }

    .grid .right {
        padding-left: 30px;
    }

    .add-patient-page {
        padding: 0;

        .left {
            border-right: none;
        }

        form.add-patient {
            margin-top: 0;
        }
    }
}
</style>
