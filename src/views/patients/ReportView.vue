<script lang="ts" setup>
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { dateToDMY } from "@/helpers/utils";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import router from "@/router";

const route = useRoute();
const isLoading = ref(true);
const record = ref();
const error = ref<string | null>(null);
const print = () => window.print();

fetchApi(API_BASE + `/reports/${route.params.id}`).then((res) => {
    isLoading.value = false;
    if (res.success) {
        record.value = res.rows[0];
    } else {
        error.value = res.message || "Something went wrong";
    }
});

const convertToHtml = (data: string) => {
    try {
        const delta = JSON.parse(data).ops;
        if (delta.length <= 1 && delta[0]?.insert === "\n") {
            throw new Error("Doesn't matter!");
        }
        return new QuillDeltaToHtmlConverter(delta, {}).convert();
    } catch (error) {
        return "";
    }
};
</script>

<template>
    <template v-if="record">
        <div class="flex items-center gap-sm buttons">
            <button @click="print" class="btn print-btn">Print</button>
            <button
                class="btn btn-outline"
                type="button"
                @click="() => router.back()"
            >
                Go back
            </button>
        </div>
        <div class="report">
            <div class="page">
                <table class="patient-details underline">
                    <tr>
                        <td class="bold">ID No: {{ record.id }}</td>
                        <td class="bold">Patient: {{ record.name }}</td>
                    </tr>
                    <tr>
                        <td>
                            Collected:
                            {{
                                dateToDMY(
                                    new Date(
                                        parseInt(record.sample_collection_date)
                                    )
                                )
                            }}
                        </td>
                        <td>Age: {{ record.age }} years</td>
                    </tr>
                    <tr>
                        <td>
                            Received:
                            {{
                                dateToDMY(new Date(parseInt(record.entry_date)))
                            }}
                        </td>
                        <td>Sex: {{ record.gender }}</td>
                    </tr>
                </table>

                <p class="referrer underline">
                    Referred by: {{ record.referer }}
                </p>
                <table class="report-details">
                    <tr>
                        <td class="bold">Diagnosis:</td>
                        <td v-html="convertToHtml(record.diagnosis)"></td>
                    </tr>
                    <tr>
                        <td class="bold">Indication:</td>
                        <td v-html="convertToHtml(record.indication)"></td>
                    </tr>
                    <template v-if="record.type === 'histo'">
                        <tr>
                            <td class="bold">Anatomical source:</td>
                            <td
                                v-html="convertToHtml(record.anatomical_source)"
                            ></td>
                        </tr>
                        <tr>
                            <td class="bold">Gross description:</td>
                            <td
                                v-html="convertToHtml(record.gross_description)"
                            ></td>
                        </tr>
                        <tr>
                            <td class="bold">No of sections embedded:</td>
                            <td>{{ record.embedded_sections }}</td>
                        </tr>
                        <tr>
                            <td class="bold">No of paraffin blocks:</td>
                            <td>{{ record.paraffin_blocks }}</td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <td class="bold">Clinical Information:</td>
                            <td
                                v-html="convertToHtml(record.clinical_info)"
                            ></td>
                        </tr>
                        <tr>
                            <td class="bold">Aspiration note:</td>
                            <td v-html="convertToHtml(record.asp_note)"></td>
                        </tr>
                        <tr>
                            <td class="bold">No of slides made:</td>
                            <td>{{ record.slides_made }}</td>
                        </tr>
                        <tr>
                            <td class="bold">No of slides stained:</td>
                            <td>{{ record.slides_stained }}</td>
                        </tr>
                    </template>
                    <tr>
                        <td class="bold">Microscopic description:</td>
                        <td
                            v-html="
                                convertToHtml(record.microscopic_description)
                            "
                        ></td>
                    </tr>
                    <tr>
                        <td class="bold">Note:</td>
                        <td v-html="convertToHtml(record.note)"></td>
                    </tr>
                </table>
            </div>
        </div>
    </template>
    <div v-else class="f-scr">
        <Loading v-if="isLoading" size="100" />
        <p v-else>{{ error }}</p>
    </div>
</template>

<style lang="scss">
.f-scr {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.buttons {
    padding: 10px;

    .btn {
        border-radius: 5px;
        padding: 5px 10px;
        border: 1px solid black;
    }
}

.report {
    height: 210mm;
    /* DIN A4 standard paper size */
    width: 297mm;
    margin: auto;
    font-size: 1.5rem;
}

@media print {
    .buttons {
        display: none;
    }
}

.page {
    margin: 1in 1in 1.2in 1in;
    padding: 1rem;
}

.bold {
    font-weight: 700;
}

.large {
    font-size: 1.75rem;
}

.underline::after {
    display: block;
    position: absolute;
    content: "";
    height: 1px;
    width: 930px;
    background-color: black;
}

.referrer {
    padding-inline: 3px;
    margin-block: 2rem;
}

table.patient-details {
    width: 100%;

    td:nth-of-type(2) {
        text-align: right;
    }
}

table.report-details {
    td:nth-of-type(1) {
        vertical-align: top;
        width: 320px;
    }

    td:nth-of-type(2) {
        vertical-align: bottom;
    }

    border-collapse: separate;
    border-spacing: 0 0.5rem;
}
</style>
