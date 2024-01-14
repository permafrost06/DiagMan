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
    <!--    <template v-if="record">
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
                <header>
                    <h1 v-if="record.type === 'histo'">
                        Histopathology Report
                    </h1>
                    <h1 v-else>Cytopathology Report</h1>
                </header>
                <div class="box">
                    <div>
                        <div class="bold">ID No: {{ record.id }}</div>
                        <div>
                            Collected:
                            {{
                                dateToDMY(
                                    new Date(
                                        parseInt(record.sample_collection_date)
                                    )
                                )
                            }}
                        </div>
                        <div>
                            Received:
                            {{
                                dateToDMY(new Date(parseInt(record.entry_date)))
                            }}
                        </div>
                    </div>
                    <div class="right">
                        <div class="bold">Patient: {{ record.name }}</div>
                        <div>
                            Age:
                            {{ record.age + " Years" }}
                        </div>
                        <div>Gender: {{ record.gender }}</div>
                        <div>Contact No: {{ record.contact }}</div>
                    </div>
                </div>
                <div class="reference">Referred by: {{ record.referer }}</div>
                <h3>Impression:</h3>
                <div
                    v-html="convertToHtml(record.impression)"
                    class="ql-container"
                ></div>
                <h3>Specimen</h3>
                {{ record.specimen }}
                <template v-if="record.type === 'histo'">
                    <h3>Gross Examination:</h3>
                    <div
                        v-html="convertToHtml(record.gross_examination)"
                        class="ql-container"
                    ></div>
                </template>
                <template v-else>
                    <h3>Aspiration Note:</h3>
                    <div
                        v-html="convertToHtml(record.aspiration_note)"
                        class="ql-container"
                    ></div>
                </template>
                <h3>M/E:</h3>

                <div
                    v-html="convertToHtml(record.microscopic_examination)"
                    class="ql-container"
                ></div>
                <h3>Note:</h3>

                <div
                    v-html="convertToHtml(record.note)"
                    class="ql-container"
                ></div>
            </div>
        </div>
    </template>
    <div v-else class="f-scr">
        <Loading v-if="isLoading" size="100" />
        <p v-else>{{ error }}</p>
        </div> -->
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
                        <td class="bold">ID No: 2021-H-02</td>
                        <td class="bold">Patient: Miss Tabia</td>
                    </tr>
                    <tr>
                        <td>Collected: 01-01-2021</td>
                        <td>Age: 14 years</td>
                    </tr>
                    <tr>
                        <td>Received: 01-01-2021</td>
                        <td>Sex: Female</td>
                    </tr>
                </table>

                <p class="referrer underline">
                    Referred by: Prof. Dr. Mostofa Mahfuzul Anwar, MBBS, FCPS
                    (ENT)
                </p>
                <table class="report-details">
                    <tr>
                        <td class="bold">Diagnosis:</td>
                        <td>
                            <p>Left thyroid nodule, Excised</p>
                            <p class="large bold">Follicular adenoma</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="bold">Indication:</td>
                        <td>
                            Thyroid swelling with FNA diagnosis of Follicular
                            neoplasm
                        </td>
                    </tr>
                    <tr>
                        <td class="bold">Anatomical source:</td>
                        <td>Left Thyroid nodule</td>
                    </tr>
                    <tr>
                        <td class="bold">Gross description:</td>
                        <td>
                            Excised thyroid tissue, measured 4x2.5x15cm
                            containing a solid mass if 3x2x1.2 cm
                        </td>
                    </tr>
                    <tr>
                        <td class="bold">No of sections embedded:</td>
                        <td>04</td>
                    </tr>
                    <tr>
                        <td class="bold">No of paraffin blocks:</td>
                        <td>02</td>
                    </tr>
                    <tr>
                        <td class="bold">Microscopic description:</td>
                        <td>
                            <p>
                                Sections showed thyroid tissue revealing a
                                benign neoplasm composed of closely packed
                                trabeculae of follicular epithelium with solid
                                areas with an intact capsule.
                            </p>
                            <p>No granuloma or malignancy was seen.</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="bold">Note:</td>
                        <td></td>
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
