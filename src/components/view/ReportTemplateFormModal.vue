<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import Loading from "@/Icons/Loading.vue";
import Input from "../../components/form/Input.vue";
import ICSelect from "../../components/form/ICSelect.vue";
import InputAutocomplete from "@/components/form/InputAutocomplete.vue";
import { onMounted, ref } from "vue";
import { fetchApi } from "@/helpers/http";
import Quill, { type QuillOptions } from "quill";

import "quill/dist/quill.snow.css";
import SimpleInput from "../form/SimpleInput.vue";

interface Props {
    onClose?: () => void;
    onAdded?: (test: any) => void;
    edit?: Record<string, string>;
}
const props = defineProps<Props>();

const quillInstances: any = {};
const quillOptions: QuillOptions = {
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

const isPosting = ref<boolean>(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const fieldErrs = ref<Record<string, string | undefined>>({});
const organVal = ref<string>(props.edit?.organ || "");
const nameVal = ref<string>(props.edit?.name || "");
const typeVal = ref<string>(props.edit?.type || "");

const diagField = ref<HTMLDivElement>();
const indicationField = ref<HTMLDivElement>();
const microField = ref<HTMLDivElement>();
const srcField = ref<HTMLDivElement>();
const grossField = ref<HTMLDivElement>();
const clinicField = ref<HTMLDivElement>();
const aspField = ref<HTMLDivElement>();

const noteField = ref<HTMLDivElement>();

onMounted(() => {
    initEditors();
    if (props.edit) {
        loadContents(props.edit);
        organVal.value = props.edit.organ;
    }
});

function loadContents(data: any) {
    for (const fName in quillInstances) {
        try {
            const delta = JSON.parse(data[fName] || "{}");
            quillInstances[fName].setContents(delta.ops);
        } catch (_e) {
            /* empty */
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

async function handleFormSubmit(evt: any) {
    if (isPosting.value) {
        return;
    }
    isPosting.value = true;

    const data = new FormData(evt.target);

    error.value = null;
    message.value = null;
    fieldErrs.value = {};

    for (const fName in quillInstances) {
        data.append(fName, JSON.stringify(quillInstances[fName].getContents()));
    }

    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: data,
    });

    if (res.success) {
        message.value = res.message!;
        props.onAdded && props.onAdded(res.rows[0]);
    } else {
        error.value = res.message;
        for (const f in res.field || {}) {
            fieldErrs.value[f] = res.field?.[f][0];
        }
    }

    isPosting.value = false;
}

const getSearchUrl = (val: string) =>
    API_BASE +
    `/settings/report-templates/organs?limit=5&search=${encodeURIComponent(
        val
    )}`;
</script>
<template>
    <div class="modal-backdrop report-template-form-modal">
        <div class="modal-body">
            <h2 class="modal-title fs-2xl">
                {{ edit?.id ? "Edit" : "Add New" }} Template
            </h2>
            <form
                method="POST"
                :action="API_BASE + '/settings/report-templates'"
                @submit.prevent="handleFormSubmit"
            >
                <input
                    type="hidden"
                    name="id"
                    :value="edit.id"
                    v-if="edit?.id"
                />
                <p v-if="error" class="form-alert error">{{ error }}</p>
                <p v-if="message" class="form-alert success">{{ message }}</p>
                <div class="input-area">
                    <ICSelect
                        label="Type"
                        name="type"
                        v-model="typeVal"
                        :hint="fieldErrs.type"
                    >
                        <option value="">Select Type</option>
                        <option value="cyto">Cytopathology</option>
                        <option value="histo">Histopathology</option>
                    </ICSelect>
                    <Input
                        name="name"
                        label="Name"
                        :hint="fieldErrs.name"
                        v-model="nameVal"
                    />
                    <InputAutocomplete
                        name="organ"
                        label="Organ"
                        v-model="organVal"
                        :hint="fieldErrs.organ"
                        :url="getSearchUrl"
                        v-slot="{ results, accept }"
                    >
                        <button
                            type="button"
                            class="organ-res-item"
                            @click="() => accept(item.organ)"
                            v-for="item in results"
                            :key="item.organ"
                            :value="item.organ"
                        >
                            {{ item.organ }}
                        </button>
                    </InputAutocomplete>
                    <div class="editor-unit">
                        <label>Diagnosis</label>
                        <div ref="diagField"></div>
                        <p v-if="fieldErrs.diagnosis" class="hint error">
                            {{ fieldErrs.diagnosis }}
                        </p>
                    </div>

                    <div class="editor-unit">
                        <label>Indication</label>
                        <div ref="indicationField"></div>
                        <p v-if="fieldErrs.indication" class="hint error">
                            {{ fieldErrs.indication }}
                        </p>
                    </div>

                    <div class="editor-unit">
                        <label>Microscopic Description</label>
                        <div ref="microField"></div>
                        <p
                            v-if="fieldErrs.microscopic_description"
                            class="hint error"
                        >
                            {{ fieldErrs.microscopic_description }}
                        </p>
                    </div>

                    <div :class="{ hidden: edit?.type !== 'cyto' }">
                        <div class="editor-unit">
                            <label>Clinical Info</label>
                            <div ref="clinicField"></div>
                            <p
                                v-if="fieldErrs.clinical_info"
                                class="hint error"
                            >
                                {{ fieldErrs.clinical_info }}
                            </p>
                        </div>
                        <div class="editor-unit">
                            <label>Aspiration Note</label>
                            <div ref="aspField"></div>
                            <p v-if="fieldErrs.asp_note" class="hint error">
                                {{ fieldErrs.asp_note }}
                            </p>
                        </div>

                        <div class="text-inputs">
                            <SimpleInput
                                :un-wrap="true"
                                label="No of slides made:"
                                name="slides_made"
                                :value="edit?.slides_made"
                                :hint="fieldErrs.slides_made"
                            />
                            <SimpleInput
                                :un-wrap="true"
                                label="No of slides stained:"
                                name="slides_stained"
                                :value="edit?.slides_stained"
                                :hint="fieldErrs.slides_stained"
                            />
                        </div>
                    </div>
                    <div :class="{ hidden: edit?.type === 'cyto' }">
                        <div class="editor-unit">
                            <label>Anatomical Source</label>
                            <div ref="srcField"></div>
                            <p
                                v-if="fieldErrs.anatomical_source"
                                class="hint error"
                            >
                                {{ fieldErrs.anatomical_source }}
                            </p>
                        </div>
                        <div class="editor-unit">
                            <label>Gross Description</label>
                            <div ref="grossField"></div>
                            <p
                                v-if="fieldErrs.gross_description"
                                class="hint error"
                            >
                                {{ fieldErrs.gross_description }}
                            </p>
                        </div>
                        <div class="text-inputs">
                            <SimpleInput
                                :un-wrap="true"
                                label="No of sections embedded:"
                                name="embedded_sections"
                                :value="edit?.embedded_sections"
                                :hint="fieldErrs.embedded_sections"
                            />
                            <SimpleInput
                                :un-wrap="true"
                                label="No of paraffin blocks:"
                                name="paraffin_blocks"
                                :value="edit?.paraffin_blocks"
                                :hint="fieldErrs.paraffin_blocks"
                            />
                        </div>
                    </div>
                    <div class="editor-unit">
                        <label>Note</label>
                        <div ref="noteField"></div>
                    </div>
                </div>
                <div class="buttons flex items-center justify-center">
                    <button type="submit">
                        <Loading v-if="isPosting" size="15" />
                        {{ edit?.id ? "Update" : "Add" }}
                    </button>
                    <button type="button" class="btn-outline" @click="onClose">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
<style lang="scss">
.modal-backdrop {
    position: fixed;
    z-index: 999;
    background: rgba($color: #000000, $alpha: 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}
.modal-body {
    min-height: 200px;
    background: var(--clr-white);
    min-width: 320px;
}

.report-template-form-modal {
    .modal-title {
        text-align: center;
        font-weight: bold;
    }

    .modal-body {
        padding: 30px 50px;
        min-width: 800px;
    }

    form {
        margin-top: 20px;

        .form-alert {
            margin-bottom: 20px;
        }
    }

    .input-area {
        max-height: calc(100vh - 250px);
        overflow-y: auto;

        & > * {
            margin-bottom: 10px;
        }

        .ic-select select,
        .ic-input,
        .auto-complete-input {
            font-size: var(--fs-base);
        }
    }

    .buttons {
        gap: 20px;
        margin-top: 30px;
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

    .organ-res-item {
        display: block;
        text-align: left;
        width: 100%;
        background: var(--clr-white);
        color: var(--clr-black);
        border-bottom: 1px solid rgba(var(--clr-grey-rgb), 0.2);
        font-size: var(--fs-base);

        &:hover {
            background: var(--clr-black);
            color: var(--clr-white);
        }
    }

    .text-inputs {
        display: grid;
        grid-template-columns: max-content auto;
        gap: 10px;
    }
}
</style>
