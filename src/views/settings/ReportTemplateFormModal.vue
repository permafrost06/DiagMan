<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import Loading from "@/Icons/Loading.vue";
import Input from "../../components/form/Input.vue";
import InputAutocomplete from "@/components/form/InputAutocomplete.vue";
import { onMounted, ref } from "vue";
import { fetchApi } from "@/helpers/http";
import Quill, { type QuillOptionsStatic } from "quill";

import "quill/dist/quill.snow.css";

interface Props {
    onClose?: () => void;
    onAdded?: (test: any) => void;
    edit?: Record<string, string>;
}
const props = defineProps<Props>();

const quillInstances: any = {};
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

const isPosting = ref<boolean>(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const fieldErrs = ref<Record<string, string | undefined>>({});
const organVal = ref<string>(props.edit?.organ || "");

const aspField = ref<HTMLDivElement>();
const meField = ref<HTMLDivElement>();
const impressionField = ref<HTMLDivElement>();
const noteField = ref<HTMLDivElement>();
const geField = ref<HTMLDivElement>();

onMounted(() => {
    initEditors();
    if (props.edit) {
        loadContents(props.edit.note, quillInstances.note);
        loadContents(props.edit.aspiration_note, quillInstances.asp);
        loadContents(props.edit.gross_examination, quillInstances.ge);
        loadContents(props.edit.impression, quillInstances.impression);
        loadContents(props.edit.microscopic_examination, quillInstances.me);
    }
});

function loadContents(data: string, quillIns: Quill) {
    try {
        quillIns.setContents(JSON.parse(data).ops);
    } catch (_e) {
        /* empty */
    }
}

async function initEditors() {
    quillInstances.asp = new Quill(aspField.value!, quillOptions);
    quillInstances.ge = new Quill(geField.value!, quillOptions);
    quillInstances.impression = new Quill(impressionField.value!, quillOptions);
    quillInstances.me = new Quill(meField.value!, quillOptions);
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

    let errCount = 0;
    if ((quillInstances.asp?.getLength() || 1) < 2) {
        errCount++;
    } else {
        data.append(
            "aspiration_note",
            JSON.stringify(quillInstances.asp.getContents())
        );
    }

    if ((quillInstances.ge?.getLength() || 1) < 2) {
        errCount++;
    } else {
        data.append(
            "gross_examination",
            JSON.stringify(quillInstances.ge.getContents())
        );
    }

    if ((quillInstances.me?.getLength() || 1) < 2) {
        errCount++;
    } else {
        data.append(
            "microscopic_examination",
            JSON.stringify(quillInstances.me.getContents())
        );
    }

    if ((quillInstances.impression?.getLength() || 1) < 2) {
        errCount++;
    } else {
        data.append(
            "impression",
            JSON.stringify(quillInstances.impression.getContents())
        );
    }

    if (errCount == 4) {
        error.value =
            "At least one of 'Aspiration Note', 'Gross Examination', 'Microscopic Examination' and 'Impression' must contain something!";
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

    if (res.success) {
        message.value = res.message!;
        props.onAdded && props.onAdded(res.rows[0]);
    } else {
        error.value = res.message;
        fieldErrs.value = {
            asp: res.field?.aspiration_note?.[0],
            ge: res.field?.gross_examination?.[0],
            me: res.field?.microscopic_examination?.[0],
            impression: res.field?.impression?.[0],
            note: res.field?.note?.[0],
            name: res.field?.name?.[0],
            organ: res.field?.organ?.[0],
        };
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
            <h2 class="fs-2xl">{{ edit ? "Edit" : "Add New" }} Template</h2>
            <form
                method="POST"
                :action="API_BASE + '/settings/report-templates'"
                @submit.prevent="handleFormSubmit"
            >
                <input type="hidden" name="id" :value="edit.id" v-if="edit" />
                <p v-if="error" class="form-alert error">{{ error }}</p>
                <p v-if="message" class="form-alert success">{{ message }}</p>
                <div class="input-area">
                    <Input
                        name="name"
                        label="Name"
                        :hint="fieldErrs.name"
                        :value="edit?.name"
                    />
                    <InputAutocomplete
                        name="organ"
                        label="Organ"
                        :v-model="organVal"
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
                        <label>Aspiration Note</label>
                        <div ref="aspField"></div>
                        <p v-if="fieldErrs.asp" class="hint error">
                            {{ fieldErrs.asp }}
                        </p>
                    </div>
                    <div class="editor-unit">
                        <label>Gross Examination</label>
                        <div ref="geField"></div>
                        <p v-if="fieldErrs.ge" class="hint error">
                            {{ fieldErrs.ge }}
                        </p>
                    </div>
                    <div class="editor-unit">
                        <label>Microscopic Examination</label>
                        <div ref="meField"></div>
                        <p v-if="fieldErrs.me" class="hint error">
                            {{ fieldErrs.me }}
                        </p>
                    </div>
                    <div class="editor-unit">
                        <label>Impression</label>
                        <div ref="impressionField"></div>
                        <p v-if="fieldErrs.impression" class="hint error">
                            {{ fieldErrs.impression }}
                        </p>
                    </div>

                    <div class="editor-unit">
                        <label>Note</label>
                        <div ref="noteField"></div>
                        <p v-if="fieldErrs.note" class="hint error">
                            {{ fieldErrs.note }}
                        </p>
                    </div>
                </div>
                <div class="buttons flex items-center justify-center">
                    <button type="submit">
                        <Loading v-if="isPosting" size="15" />
                        {{ edit ? "Update" : "Add" }}
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
    h2 {
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
    }
}
</style>
