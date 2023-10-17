<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import Icon from "@/components/base/Icon.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Quill, { type QuillOptionsStatic } from "quill";

import "quill/dist/quill.snow.css";
import { dateToDMY } from "@/helpers/utils";
import EditPatient from "./EditPatient.vue";

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

const editMode = ref(false);

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

const errors = ref<Record<string, string | undefined>>({});

onMounted(async () => {
    initEditors();
    const id = route.params.id;
    isLoading.value = true;
    const res = await fetchApi(API_BASE + `/reports/${id}`);
    if (res.success) {
        patient.value = res.rows[0];
        const p = res.rows[0];
        try {
            const asp = JSON.parse(
                p.type === "cyto" ? p.aspiration_note : p.gross_examination
            );
            quillInstances.asp.setContents(asp.ops);
        } catch (_e) {
            /* empty */
        }
        try {
            const me = JSON.parse(p.microscopic_examination);
            quillInstances.me.setContents(me.ops);
        } catch (_e) {
            /* empty */
        }
        try {
            const impression = JSON.parse(p.impression);
            quillInstances.impression.setContents(impression.ops);
        } catch (_e) {
            /* empty */
        }
        try {
            if (patient.value) {
                patient.value.note = JSON.parse(p.note);
                noteFieldVisible.value = !!patient.value.note.ops;
            }
        } catch (_e) {
            /* empty */
        }
    }
    isLoading.value = false;
});

watch(noteFieldVisible, async () => {
    await nextTick();
    if (noteFieldVisible.value) {
        quillInstances.note = new Quill(noteField.value!, quillOptions);
        if (patient.value?.note) {
            quillInstances.note.setContents(patient.value.note.ops);
        }
    }
});

async function initEditors() {
    quillInstances.asp = new Quill(aspField.value!, quillOptions);
    quillInstances.impression = new Quill(impressionField.value!, quillOptions);
    quillInstances.me = new Quill(meField.value!, quillOptions);
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
        // router.back();
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
                /><path fill="none" d="M0 0h36v36H0z" />
            </Icon>
        </RouterLink>

        <form
            :action="API_BASE + '/reports'"
            method="POST"
            @submit.prevent="handleFormSubmit"
            :class="{
                block: editMode,
                grid: !editMode,
            }"
        >
            <div class="left" v-if="!editMode">
                <div class="patient-info fs-md" v-if="patient">
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

                    <p>Sample collection date</p>
                    <p>
                        {{
                            dateToDMY(
                                new Date(
                                    parseInt(patient.sample_collection_date)
                                )
                            )
                        }}
                    </p>

                    <p>Entry date</p>
                    <p>
                        {{ dateToDMY(new Date(parseInt(patient.entry_date))) }}
                    </p>

                    <p>Tests</p>
                    <p class="bold">{{ patient.test_names }}</p>

                    <p>Delivery date</p>
                    <p>
                        {{
                            dateToDMY(new Date(parseInt(patient.delivery_date)))
                        }}
                    </p>
                </div>
                <div v-else-if="isLoading" class="flex justify-center">
                    <Loading size="60" />
                </div>
                <div v-else>
                    <p class="form-alert error">This patient id is invalid!</p>
                </div>
                <div class="submit-area">
                    <CheckBox
                        label="Lock Report"
                        name="locked"
                        value="1"
                        :checked="patient?.locked"
                    />
                    <div class="flex gap-sm mt-sm">
                        <button type="submit" value="add">
                            <Loading
                                v-if="isPosting === true || isPosting === 'add'"
                            />
                            Add Report
                        </button>
                    </div>
                </div>
            </div>
            <EditPatient v-else :headless="true" />
            <div class="right">
                <p class="form-alert error" v-if="error">{{ error }}</p>
                <p class="form-alert success" v-if="message">{{ message }}</p>

                <input type="hidden" name="id" :value="patient?.id" />
                <div class="editor-unit">
                    <label v-if="patient?.type === 'cyto'"
                        >Aspiration Note</label
                    >
                    <label v-else>Gross Examination</label>
                    <div ref="aspField"></div>
                    <p v-if="errors.asp" class="hint error">{{ errors.asp }}</p>
                </div>
                <div class="editor-unit">
                    <label>Microscopic Examination</label>
                    <div ref="meField"></div>
                    <p v-if="errors.me" class="hint error">{{ errors.me }}</p>
                </div>
                <div class="editor-unit">
                    <label>Impression</label>
                    <div ref="impressionField"></div>
                    <p v-if="errors.impression" class="hint error">
                        {{ errors.impression }}
                    </p>
                </div>

                <div class="editor-unit" v-if="noteFieldVisible">
                    <label>Note</label>
                    <div ref="noteField"></div>
                </div>
                <div v-else class="flex justify-end">
                    <button
                        class="btn-outline"
                        @click="noteFieldVisible = true"
                    >
                        + Add Note
                    </button>
                </div>
                <div class="submit-area-2" v-if="editMode">
                    <CheckBox
                        label="Lock Report"
                        name="locked"
                        value="1"
                        :checked="patient?.locked"
                    />
                    <div class="flex gap-sm mt-sm">
                        <button type="submit" value="add">
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
</template>
<style lang="scss">
.report-page {
    margin: 30px;
    display: flex;
    flex-flow: column;
    min-height: calc(100% - 80px);

    form {
        margin-top: 30px;
        flex-grow: 1;

        &.grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
    }

    .left {
        border-right: 1px solid var(--clr-black);
        position: relative;

        .patient-info {
            display: grid;
            grid-template-columns: auto auto;
            gap: 10px;
            padding-bottom: 120px;

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
            position: absolute;
            bottom: 0px;
            left: 0px;
            width: calc(50% - 38px);
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
