<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import Icon from "@/components/base/Icon.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
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

const aspField = ref<HTMLDivElement>();
const meField = ref<HTMLDivElement>();
const impressionField = ref<HTMLDivElement>();
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
        setEditorContent(
            quillInstances.asp,
            p.type === "cyto" ? p.aspiration_note : p.gross_examination
        );
        setEditorContent(quillInstances.me, p.microscopic_examination);
        setEditorContent(quillInstances.impression, p.impression);
        setEditorContent(quillInstances.note, p.note);
        noteFieldVisible.value = quillInstances.note.getLength() > 1;
        reCheckEditors();
    }
    isLoading.value = false;
});

watch(noteFieldVisible, async () => {
    await nextTick();
    if (noteFieldVisible.value) {
        if (patient.value?.note) {
            quillInstances.note.setContents(patient.value.note.ops);
        }
    }
});

function setEditorContent(editor: any, data: string) {
    try {
        const impression = JSON.parse(data);
        editor.setContents(impression.ops);
    } catch (_e) {
        editor.setContents([]);
    }
}

async function initEditors() {
    quillInstances.asp = new Quill(aspField.value!, quillOptions);
    quillInstances.impression = new Quill(impressionField.value!, quillOptions);
    quillInstances.me = new Quill(meField.value!, quillOptions);
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

    let errCount = 0;
    if ((quillInstances.asp?.getLength() || 1) < 2) {
        errors.value.asp = `${
            patient.value?.type === "cyto"
                ? "Aspiration note"
                : "Gross examination"
        } is required!`;
        errCount++;
    } else {
        data.append(
            patient.value?.type === "cyto"
                ? "aspiration_note"
                : "gross_examination",
            JSON.stringify(quillInstances.asp.getContents())
        );
    }

    if ((quillInstances.me?.getLength() || 1) < 2) {
        errors.value.me = "Microscopic examination is required!";
        errCount++;
    } else {
        data.append(
            "microscopic_examination",
            JSON.stringify(quillInstances.me.getContents())
        );
    }
    if ((quillInstances.impression?.getLength() || 1) < 2) {
        errors.value.impression = "Impression is required!";
        errCount++;
    } else {
        data.append(
            "impression",
            JSON.stringify(quillInstances.impression.getContents())
        );
    }

    if (errCount > 0) {
        error.value =
            errors.value.asp ||
            errors.value.me ||
            errors.value.impression ||
            "";
        if (errCount > 1) {
            error.value += ` (+${errCount - 1} errors)`;
        }
        isPosting.value = false;
        return;
    }

    if (quillInstances.note) {
        data.append("note", JSON.stringify(quillInstances.note.getContents()));
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
        errors.value = {
            asp:
                res.field?.aspiration_note?.[0] ||
                res.field?.gross_examination?.[0],
            me: res.field?.microscopic_examination?.[0],
            impression: res.field?.impression?.[0],
        };
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
    setEditorContent(
        quillInstances.asp,
        patient.value?.type === "cyto"
            ? template.aspiration_note
            : template.gross_examination
    );
    setEditorContent(quillInstances.me, template.microscopic_examination);
    setEditorContent(quillInstances.impression, template.impression);
    setEditorContent(quillInstances.note, template.note);
    noteFieldVisible.value = quillInstances.note.getLength() > 1;
};

const showTemplateSaver = () => {
    templateModalValue.value = {
        type: patient.value?.type === "cyto" ? "cyto" : "histo",
        microscopic_examination: JSON.stringify(
            quillInstances.me.getContents()
        ),
        impression: JSON.stringify(quillInstances.impression.getContents()),
        note: JSON.stringify(quillInstances.note.getContents()),
    };
    if (patient.value?.type === "cyto") {
        templateModalValue.value.aspiration_note = JSON.stringify(
            quillInstances.asp.getContents()
        );
    } else {
        templateModalValue.value.gross_examination = JSON.stringify(
            quillInstances.asp.getContents()
        );
    }
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
                <div class="editor-n-template-grid">
                    <div>
                        <div class="editor-unit">
                            <label v-if="patient?.type === 'cyto'"
                                >Aspiration Note</label
                            >
                            <label v-else>Gross Examination</label>
                            <div ref="aspField"></div>
                            <p v-if="errors.asp" class="hint error">
                                {{ errors.asp }}
                            </p>
                        </div>
                        <div class="editor-unit">
                            <label>Microscopic Examination</label>
                            <div ref="meField"></div>
                            <p v-if="errors.me" class="hint error">
                                {{ errors.me }}
                            </p>
                        </div>
                        <div class="editor-unit">
                            <label>Impression</label>
                            <div ref="impressionField"></div>
                            <p v-if="errors.impression" class="hint error">
                                {{ errors.impression }}
                            </p>
                        </div>

                        <div
                            class="editor-unit"
                            :class="{ hidden: !noteFieldVisible }"
                        >
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
