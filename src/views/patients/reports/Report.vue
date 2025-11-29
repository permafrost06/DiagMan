<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
import SimpleInput from "@/components/form/SimpleInput.vue";
import ReportTemplateFormModal from "@/components/view/ReportTemplateFormModal.vue";
import ReportTemplateSelector from "@/components/view/ReportTemplateSelector.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Quill, { type QuillOptions } from "quill";

import "quill/dist/quill.snow.css";
import { dateToDMY } from "@/helpers/utils";
import EditPatient from "../EditPatient.vue";
import { useUser } from "@/stores/user";
import router from "@/router";
import HeaderSimple from "@/components/view/HeaderSimple.vue";

// Configure custom font sizes for Quill
const fontSizeArr = [
    "11pt",
    "8pt",
    "10pt",
    "12pt",
    "14pt",
    "16pt",
    "18pt",
    "20pt",
    "24pt",
    "28pt",
    "32pt",
    "36pt",
];
const Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

const quillOptions: QuillOptions = {
    debug: "error",
    modules: {
        toolbar: [
            { size: fontSizeArr },
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

const errors = ref<Record<string, string | undefined>>({});

const patientInfoExpanded = ref<boolean>(false);
const hoveredTemplate = ref<Record<string, any> | null>(null);

function extractTextFromQuillDelta(quillJson: string): string {
    try {
        const delta = JSON.parse(quillJson);
        if (!delta.ops || !Array.isArray(delta.ops)) {
            return "";
        }
        return delta.ops
            .map((op: any) => {
                if (typeof op.insert === "string") {
                    return op.insert;
                }
                return "";
            })
            .join("")
            .trim();
    } catch (e) {
        return "";
    }
}

onMounted(async () => {
    window.scrollTo(0, 0);
    initEditors();

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
            quillInstances.note.setContents(
                JSON.parse(patient.value.note || "{}").ops,
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
        quillOptions,
    );
    quillInstances.anatomical_source = new Quill(srcField.value!, quillOptions);
    quillInstances.gross_description = new Quill(
        grossField.value!,
        quillOptions,
    );
    quillInstances.clinical_info = new Quill(clinicField.value!, quillOptions);
    quillInstances.asp_note = new Quill(aspField.value!, quillOptions);

    quillInstances.note = new Quill(noteField.value!, quillOptions);
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

const extractTextFromQuillContent = (content: any): string => {
    try {
        if (!content.ops || !Array.isArray(content.ops)) {
            return "";
        }
        return content.ops
            .map((op: any) => {
                if (typeof op.insert === "string") {
                    return op.insert;
                }
                return "";
            })
            .join("")
            .trim();
    } catch (e) {
        return "";
    }
};

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
        const content = quillInstances[fName].getContents();
        const text = extractTextFromQuillContent(content);

        // Set to empty string if field is empty after trimming
        if (text === "" || text.trim() === "") {
            data.set(fName, "");
        } else {
            data.set(fName, JSON.stringify(content));
        }
    }

    // Set fields to empty based on patient type to ensure they remain null in DB
    if (patient.value?.type === "histo") {
        // For histo reports, asp_note should be null
        data.set("asp_note", "");
    } else if (patient.value?.type === "cyto") {
        // For cyto reports, gross_description should be null
        data.set("gross_description", "");
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

const onPatientUpdate = async (_row: any, msg: string) => {
    message.value = msg;

    const id = _row.id;
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
};

const onTemplateSelected = (template: Record<string, any>) => {
    setEditorContent(template);
    noteFieldVisible.value = quillInstances.note.getLength() > 1;
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
        <HeaderSimple title="Report" />
        <form
            :action="API_BASE + '/reports'"
            method="POST"
            @submit.prevent="handleFormSubmit"
            class="grid"
        >
            <div class="top">
                <div v-if="isLoading" class="flex justify-center">
                    <Loading size="60" />
                </div>
                <div v-else-if="patient" class="flex-grow">
                    <div class="patient-info-section">
                        <div
                            class="patient-info-header"
                            @click="patientInfoExpanded = !patientInfoExpanded"
                        >
                            <div class="header-content">
                                <div class="header-row">
                                    <span>Patient ID:</span>
                                    <span class="value bold">{{
                                        patient.id
                                    }}</span>
                                </div>
                                <div class="header-row">
                                    <span>Name:</span>
                                    <span class="value">{{
                                        patient.name
                                    }}</span>
                                </div>
                                <div class="header-row">
                                    <span>Specimen:</span>
                                    <span class="value bold">{{
                                        patient.specimen
                                    }}</span>
                                </div>
                                <div class="header-row">
                                    <span>Tests:</span>
                                    <span class="value bold">{{
                                        patient.test_names
                                    }}</span>
                                </div>
                            </div>
                            <div
                                class="collapse-icon"
                                :class="{ expanded: patientInfoExpanded }"
                            >
                                ▶
                            </div>
                        </div>

                        <div
                            v-if="patientInfoExpanded"
                            class="patient-info fs-md"
                        >
                            <div class="header-row">
                                <span>Type:</span>
                                <span class="value capitalize"
                                    >{{ patient.type }}pathology</span
                                >
                            </div>

                            <div class="header-row">
                                <span>Age:</span>
                                <span class="value">{{ patient.age }}</span>
                            </div>

                            <div class="header-row">
                                <span>Gender:</span>
                                <span class="value capitalize">{{
                                    patient.gender
                                }}</span>
                            </div>

                            <div class="header-row">
                                <span>Contact:</span>
                                <span class="value">{{ patient.contact }}</span>
                            </div>

                            <div class="header-row">
                                <span>Referer:</span>
                                <span class="value">{{ patient.referer }}</span>
                            </div>

                            <div class="header-row">
                                <span>Specimen collection date:</span>
                                <span class="value">
                                    {{
                                        dateToDMY(
                                            new Date(
                                                parseInt(
                                                    patient.sample_collection_date,
                                                ),
                                            ),
                                        )
                                    }}
                                </span>
                            </div>

                            <div class="header-row">
                                <span>Specimen receiving date:</span>
                                <span class="value">
                                    {{
                                        dateToDMY(
                                            new Date(
                                                parseInt(patient.entry_date),
                                            ),
                                        )
                                    }}
                                </span>
                            </div>

                            <div class="header-row">
                                <span>Report delivery date:</span>
                                <span class="value">
                                    {{
                                        dateToDMY(
                                            new Date(
                                                parseInt(patient.delivery_date),
                                            ),
                                        )
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <p class="form-alert error">This patient id is invalid!</p>
                </div>
            </div>
            <div class="bottom">
                <p class="form-alert error" v-if="error">{{ error }}</p>
                <p class="form-alert success" v-if="message">{{ message }}</p>

                <div class="form-area">
                    <ReportTemplateSelector
                        :patient-type="
                            patient?.type
                                ? patient.type === 'cyto'
                                    ? 'cyto'
                                    : 'histo'
                                : ''
                        "
                        @select-template="onTemplateSelected"
                        @hover-template="
                            (template) => (hoveredTemplate = template)
                        "
                    />
                    <div class="form-container">
                        <input type="hidden" name="id" :value="patient?.id" />
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

                        <div :class="{ hidden: patient?.type !== 'cyto' }">
                            <div class="editor-unit">
                                <label>Clinical Info</label>
                                <div ref="clinicField"></div>
                                <p
                                    v-if="errors.clinical_info"
                                    class="hint error"
                                >
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

                        <div :class="{ hidden: patient?.type === 'cyto' }">
                            <div class="editor-unit">
                                <label>Anatomical Source</label>
                                <div ref="srcField"></div>
                                <p
                                    v-if="errors.anatomical_source"
                                    class="hint error"
                                >
                                    {{ errors.anatomical_source }}
                                </p>
                            </div>
                            <div class="editor-unit">
                                <label>Gross Description</label>
                                <div ref="grossField"></div>
                                <p
                                    v-if="errors.gross_description"
                                    class="hint error"
                                >
                                    {{ errors.gross_description }}
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

                        <div class="editor-unit">
                            <label>Microscopic Description</label>
                            <div ref="microField"></div>
                            <p
                                v-if="errors.microscopic_description"
                                class="hint error"
                            >
                                {{ errors.microscopic_description }}
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
                                        v-if="
                                            isPosting === true ||
                                            isPosting === 'add'
                                        "
                                    />
                                    Update Report
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="hoveredTemplate" class="template-preview-panel">
                <div class="preview-content">
                    <div
                        v-if="hoveredTemplate.diagnosis"
                        class="preview-section"
                    >
                        <div class="preview-label">Diagnosis:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.diagnosis,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.indication"
                        class="preview-section"
                    >
                        <div class="preview-label">Indication:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.indication,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.microscopic_description"
                        class="preview-section"
                    >
                        <div class="preview-label">
                            Microscopic Description:
                        </div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.microscopic_description,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.anatomical_source"
                        class="preview-section"
                    >
                        <div class="preview-label">Anatomical Source:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.anatomical_source,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.gross_description"
                        class="preview-section"
                    >
                        <div class="preview-label">Gross Description:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.gross_description,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.clinical_info"
                        class="preview-section"
                    >
                        <div class="preview-label">Clinical Info:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.clinical_info,
                                )
                            }}
                        </div>
                    </div>
                    <div
                        v-if="hoveredTemplate.asp_note"
                        class="preview-section"
                    >
                        <div class="preview-label">Aspiration Note:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(
                                    hoveredTemplate.asp_note,
                                )
                            }}
                        </div>
                    </div>
                    <div v-if="hoveredTemplate.note" class="preview-section">
                        <div class="preview-label">Note:</div>
                        <div class="preview-text">
                            {{
                                extractTextFromQuillDelta(hoveredTemplate.note)
                            }}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>
<style lang="scss">
.report-page {
    margin: 30px;

    form {
        margin-top: 30px;

        &.grid {
            display: flex;
            flex-direction: column;
            padding-bottom: 50px;
        }
    }

    .top {
        position: relative;
        padding-bottom: 20px;
        display: flex;
        flex-flow: column;

        .patient-info-section {
            border: 1px solid var(--clr-black);
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .header-row {
            display: flex;
            align-items: center;
            gap: 8px;

            .value {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .patient-info-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 12px;
            background-color: var(--clr-light-gray);
            cursor: pointer;
            user-select: none;

            .header-content {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px 20px;
                font-size: var(--fs-md);
            }

            .collapse-icon {
                margin-left: 10px;
                font-size: 30px;
                transition: transform 0.2s ease;
                flex-shrink: 0;

                &.expanded {
                    transform: rotate(90deg);
                }
            }
        }

        .patient-info {
            display: grid;
            grid-template-columns: auto auto;
            grid-template-rows: min-content;
            gap: 10px;
            padding: 12px;

            p {
                margin-top: 10px;

                &:first-child,
                &:nth-child(2) {
                    margin-top: 0;
                }
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

    .bottom {
        .form-alert {
            margin-bottom: 20px;
        }

        .form-container {
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
                    min-height: 120px;

                    & > .ql-editor {
                        min-height: 120px;
                    }
                }
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
    }

    .form-area {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .grid .bottom {
        padding: 0;
        width: 100%;
    }

    .add-patient-page {
        padding: 0;

        .top {
            border-right: none;
        }

        .add-patient {
            margin-top: 0;
        }
    }

    .template-preview-panel {
        position: fixed;
        right: 30px;
        top: 50%;
        transform: translate(-30%, -50%);
        width: 500px;
        max-height: 80vh;
        border: 1px solid var(--clr-black);
        border-radius: 4px;
        background-color: var(--clr-white);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        overflow-y: auto;
        z-index: 1000;

        .preview-content {
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .preview-section {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .preview-label {
                font-weight: 600;
                font-size: 18px;
                color: var(--clr-text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .preview-text {
                font-size: 16px;
                line-height: 1.5;
                word-break: break-word;
                white-space: pre-wrap;
            }
        }
    }
}
</style>
