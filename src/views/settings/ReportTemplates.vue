<script setup lang="ts">
import ReportTemplateFormModal from "@/components/view/ReportTemplateFormModal.vue";
import ConfirmModal from "@/components/modal/ConfirmModal.vue";
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

let tOut: any = 0;
const formValue = ref<boolean | Record<string, string>>(false);
const deleteValue = ref();
const isLoading = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
const reportTemplates = ref<Record<string, string>[]>([]);
const error = ref<string | null>(null);
const organs = ref<{ organ: string }[]>([]);
const query = ref({
    organ: "",
});

const aspField = ref<HTMLDivElement>();
const meField = ref<HTMLDivElement>();
const impressionField = ref<HTMLDivElement>();
const noteField = ref<HTMLDivElement>();
const geField = ref<HTMLDivElement>();

const active = ref<Record<string, any> | undefined>();

onMounted(() => {
    getOrgans();
    getReportTemplates();
});

async function getReportTemplates() {
    tOut = 0;
    if (isLoading.value) {
        return;
    }
    isLoading.value = true;
    const qs = new URLSearchParams(query.value);
    const res = await fetchApi(
        API_BASE + `/settings/report-templates?${qs.toString()}`
    );
    isLoading.value = false;
    if (!res.success) {
        error.value = res.message || "Something went wrong!";
        return;
    }
    reportTemplates.value = res.rows;
    showDetails(res.rows[0]);
}

async function getOrgans() {
    const res = await fetchApi(API_BASE + `/settings/report-templates/organs`);
    if (!res.success) {
        error.value =
            res.message || "Something went wrong! Couldn't get organs...";
        return;
    }
    organs.value = res.rows;
}

const loadPage = () => {
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = setTimeout(getReportTemplates, 500);
};

const onAdded = (tem: any) => {
    if (organs.value.findIndex((o) => o.organ == tem.organ) === -1) {
        organs.value.push({
            organ: tem.organ,
        });
    }
    if (typeof formValue.value !== "object") {
        reportTemplates.value.unshift(tem);
        return;
    }
    const filtered = reportTemplates.value.filter(
        // @ts-ignore
        (t) => t.id != formValue.value.id
    );
    filtered.unshift(tem);
    reportTemplates.value = filtered;
    formValue.value = false;
    if (active.value?.id == tem.id) {
        showDetails(tem);
    }
};

async function deleteTemplate() {
    if (!deleteValue.value || isDeleting.value) {
        return;
    }
    isDeleting.value = true;
    const res = await fetchApi(
        `${API_BASE}/settings/report-templates/${deleteValue.value.id}`,
        {
            method: "POST",
            body: JSON.stringify({
                id: deleteValue.value?.id,
            }),
        }
    );
    isDeleting.value = false;
    if (res.success) {
        error.value = null;
        reportTemplates.value = reportTemplates.value.filter(
            (tem) => tem.id != deleteValue.value?.id
        );
        if (deleteValue.value.id == active.value?.id) {
            showDetails(reportTemplates.value[0]);
        }
        deleteValue.value = null;
    } else {
        error.value = res.message;
    }
}

const convertToHtml = (data: string, el: HTMLDivElement) => {
    try {
        const delta = JSON.parse(data).ops;
        if (delta.length < 2) {
            throw new Error("Doesn't matter!");
        }
        const html = new QuillDeltaToHtmlConverter(delta, {}).convert();
        el.innerHTML = html;
        el.parentElement?.classList.remove("hidden");
    } catch (error) {
        el.innerHTML = "";
        el.parentElement?.classList.add("hidden");
    }
};

function showDetails(data?: Record<string, any>) {
    if (!data) {
        return;
    }
    active.value = data;
    convertToHtml(data.note, noteField.value!);
    convertToHtml(data.aspiration_note, aspField.value!);
    convertToHtml(data.gross_examination, geField.value!);
    convertToHtml(data.impression, impressionField.value!);
    convertToHtml(data.microscopic_examination, meField.value!);
}
</script>
<template>
    <div class="report-template-settings">
        <h1 class="page-title fs-2xl">Report Templates</h1>
        <div class="flex items-center gap-sm">
            <button class="add-btn" @click="formValue = true">
                + Add Template
            </button>
            <div class="filter-area flex items-center">
                <select v-model="query.organ" @input="loadPage">
                    <option value="">All</option>
                    <option
                        v-for="organ in organs"
                        :key="organ.organ"
                        :value="organ.organ"
                    >
                        {{ organ.organ }}
                    </option>
                </select>
            </div>
        </div>
        <div class="rt-content-area">
            <div class="table-wrapper">
                <table width="100%">
                    <tr class="font-h">
                        <th>Name</th>
                        <th>Organ</th>
                        <th class="actions-col">Actions</th>
                    </tr>
                    <template v-if="isLoading">
                        <tr
                            v-for="i in 10"
                            :key="i"
                            :class="'skeleton-' + (i % 4)"
                        >
                            <td>
                                <div class="skeleton"></div>
                            </td>
                            <td>
                                <div class="skeleton"></div>
                            </td>
                            <td class="flex items-center gap-sm">
                                <div class="skeleton btn"></div>
                                <div class="skeleton btn"></div>
                            </td>
                        </tr>
                    </template>
                    <tr v-else-if="!reportTemplates?.length">
                        <td colspan="3">
                            {{ error || "No test matched your query!" }}
                        </td>
                    </tr>
                    <template v-else>
                        <tr
                            v-for="tem in reportTemplates"
                            :key="tem.id"
                            :class="{ active: tem.id === active?.id }"
                            @click="() => showDetails(tem)"
                        >
                            <td class="capitalize">{{ tem.name }}</td>
                            <td class="capitalize">
                                {{ tem.organ }}
                            </td>
                            <td>
                                <div class="flex gap-sm row-actions">
                                    <button
                                        class="btn-outline"
                                        @click="formValue = tem"
                                    >
                                        Modify
                                    </button>
                                    <button
                                        class="btn-outline"
                                        @click="deleteValue = tem"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </table>
            </div>
            <div class="rt-details">
                <h2>Details</h2>
                <div
                    class="editor-unit"
                    :class="{ hidden: active?.type !== 'cyto' }"
                >
                    <label>Aspiration Note</label>
                    <div class="ql-container" ref="aspField"></div>
                </div>
                <div
                    class="editor-unit"
                    :class="{ hidden: active?.type !== 'histo' }"
                >
                    <label>Gross Examination</label>
                    <div class="ql-container" ref="geField"></div>
                </div>
                <div class="editor-unit">
                    <label>Microscopic Examination</label>
                    <div class="ql-container" ref="meField"></div>
                </div>
                <div class="editor-unit">
                    <label>Impression</label>
                    <div class="ql-container" ref="impressionField"></div>
                </div>

                <div class="editor-unit">
                    <label>Note</label>
                    <div class="ql-container" ref="noteField"></div>
                </div>
            </div>
        </div>
    </div>
    <ReportTemplateFormModal
        v-if="formValue"
        :onClose="() => (formValue = false)"
        :onAdded="onAdded"
        :edit="typeof formValue === 'object' ? formValue : undefined"
    />

    <ConfirmModal title="Are you sure?" icon="delete" v-if="deleteValue">
        <p v-if="error" class="form-alert error">{{ error }}</p>
        <p>
            Are you sure to delete the template named
            <span class="bold"> {{ deleteValue.name }} </span>?
        </p>
        <p class="danger fs-md bold">It cannot be undone!</p>
        <template v-slot:buttons>
            <button @click="deleteTemplate">
                <Loading v-if="isDeleting" size="15" />
                Delete
            </button>
            <button class="btn-outline" @click="deleteValue = null">
                Cancel
            </button>
        </template>
    </ConfirmModal>
</template>

<style lang="scss">
.report-template-settings {
    height: 100%;
    display: flex;
    flex-flow: column;

    .page-title {
        border-bottom: 1px solid var(--clr-black);
        margin-bottom: 30px;
    }

    .add-btn {
        padding: 5px 15px;
        font-weight: bold;
    }

    .filter-area {
        gap: 20px;
        flex-grow: 1;

        select,
        input {
            max-width: max-content;
            padding: 2px 5px;
            margin: 0;
            margin-left: 2px;
        }
    }

    .skeleton.btn {
        height: 1.5em;
        width: 100%;
    }

    .table-wrapper {
        flex-grow: 1;
        overflow: auto;
    }

    table {
        border-collapse: collapse;

        .actions-col {
            width: 165px;
        }

        tr {
            border-bottom: 1px solid var(--clr-black);
            cursor: pointer;
            &.active {
                background: rgba(var(--clr-grey-rgb), 0.1);
            }
        }
        tr:first-child {
            border-bottom-width: 2px;
        }
        th {
            font-size: var(--fs-base);
        }

        th,
        td {
            padding: 8px 15px;
            text-align: left;
        }
    }

    .row-actions button {
        padding: 3px 10px;
        font-weight: 600;
    }

    .rt-content-area {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 15px;

        .rt-details {
            > h2 {
                font-size: var(--fs-base);
                font-weight: bold;
                border-bottom: 2px solid var(--clr-black);
                padding: 8px 15px;
            }
        }

        .editor-unit {
            margin-bottom: 20px;
            padding: 15px;

            label {
                font-weight: 500;
                border-bottom: 1px solid;
                padding-bottom: 5px;
            }

            .ql-container {
                padding: 10px;
            }
        }
    }
}
</style>
