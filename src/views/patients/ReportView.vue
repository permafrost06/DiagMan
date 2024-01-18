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
const note = ref<string>("");
fetchApi(API_BASE + `/reports/${route.params.id}`).then((res) => {
    isLoading.value = false;
    if (res.success) {
        record.value = res.rows[0];
        note.value = convertToHtml(record.value.note);
    } else {
        error.value = res.message || "Something went wrong";
    }
});

function convertToHtml(data: string): string {
    try {
        const delta = JSON.parse(data).ops;
        if (delta.length <= 1 && delta[0]?.insert === "\n") {
            throw new Error("Doesn't matter!");
        }
        return new QuillDeltaToHtmlConverter(delta, {}).convert();
    } catch (error) {
        return "";
    }
}
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
        <div class="page">
            <div class="report">
                <h1>
                    {{
                        record.type === "cyto"
                            ? "Cytopathology"
                            : "Histopathology"
                    }}
                    Report
                </h1>
                <div class="patient-info underline">
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
                    <div class="right-align">
                        <div class="bold">Patient: {{ record.name }}</div>
                        <div>Age: {{ record.age }} years</div>
                        <div>
                            Sex:
                            <span class="capitalize">{{ record.gender }}</span>
                        </div>
                    </div>
                </div>

                <p class="referrer underline">
                    Referred by: {{ record.referer }}
                </p>
                <div class="report-details">
                    <div>
                        <div class="bold">Diagnosis:</div>
                        <div v-html="convertToHtml(record.diagnosis)"></div>
                    </div>
                    <div>
                        <div class="bold">Indication:</div>
                        <div v-html="convertToHtml(record.indication)"></div>
                    </div>
                    <template v-if="record.type === 'histo'">
                        <div>
                            <div class="bold">Specimen:</div>
                            <div
                                v-html="convertToHtml(record.anatomical_source)"
                            ></div>
                        </div>
                        <div>
                            <div class="bold">Gross description:</div>
                            <div
                                v-html="convertToHtml(record.gross_description)"
                            ></div>
                        </div>
                        <div>
                            <div class="bold">No of sections embedded:</div>
                            <div>{{ record.embedded_sections }}</div>
                        </div>
                        <div>
                            <div class="bold">No of paraffin blocks:</div>
                            <div>{{ record.paraffin_blocks }}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div>
                            <div class="bold">Clinical Information:</div>
                            <div
                                v-html="convertToHtml(record.clinical_info)"
                            ></div>
                        </div>
                        <div>
                            <div class="bold">Aspiration note:</div>
                            <div v-html="convertToHtml(record.asp_note)"></div>
                        </div>
                        <div>
                            <div class="bold">No of slides made:</div>
                            <div>{{ record.slides_made }}</div>
                        </div>
                        <div>
                            <div class="bold">No of slides stained:</div>
                            <div>{{ record.slides_stained }}</div>
                        </div>
                    </template>
                    <div>
                        <div class="bold">Microscopic description:</div>
                        <div
                            v-html="
                                convertToHtml(record.microscopic_description)
                            "
                        ></div>
                    </div>
                    <div v-if="note">
                        <div class="bold">Note:</div>
                        <div v-html="note"></div>
                    </div>
                </div>
            </div>
        </div>
    </template>
    <div v-else class="loading-indicator">
        <Loading v-if="isLoading" size="100" />
        <p v-else>{{ error }}</p>
    </div>
</template>

<style lang="scss">
.loading-indicator {
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

@media print {
    .buttons {
        display: none;
    }

    .page {
        width: 7.3in;
    }
}

@media screen {
    .page {
        width: 8.35in;
        padding: 1.31in 0.5in 3.4in 0.5in;
        margin-inline: auto;
    }
}

.report {
    font-size: 11pt;
    font-family: "Times New Roman";

    * {
        font-family: "Times New Roman";
    }
}

.bold {
    font-weight: 700;
}

.underline {
    border-bottom: 1px solid black;
}

.referrer {
    margin-block: 0.75rem 1rem;
}

h1 {
    text-align: center;
    text-decoration: underline;
    margin-bottom: 0.3in;
    font-size: 18pt;
}

.patient-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.right-align {
    text-align: right;
}

.report-details {
    display: grid;
    gap: 0.1in;

    & > div {
        display: grid;
        grid-template-columns: 1.7in 1fr;

        break-inside: avoid;
    }
}

.capitalize {
    text-transform: capitalize;
}

strong {
    font-size: 11pt;
}

h2 {
    font-size: 14pt;

    & > * {
        font-size: 14pt;
    }
}
</style>
