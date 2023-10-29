<script lang="ts" setup>
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { dateToDMY } from "@/helpers/utils";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

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
            <RouterLink
                :to="{
                    name: 'report',
                    params: {
                        id: route.params.id,
                    },
                }"
                class="btn btn-outline"
            >
                Go back
            </RouterLink>
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
    height: 210mm; /* DIN A4 standard paper size */
    width: 297mm;
    margin: auto;

    .page {
        font-family: "Times New Roman";

        margin: 0;
        /* you don't really have to explicitly set it to 0 unless it's already set to something else */
        header h1 {
            color: black;
            text-align: center;
            text-transform: uppercase;
            text-decoration: underline;
            font-size: 2rem;
            margin-bottom: 3rem;
        }

        font-size: 1.2rem;
    }

    .bold {
        font-weight: 800;
    }

    .right {
        text-align: right;
    }

    .box {
        display: flex;
        justify-content: space-between;
    }

    .reference {
        margin-top: 1rem;
        border-bottom: 1px solid black;
    }

    h3 {
        font-weight: 800;
        margin: 0;
        margin-top: 1.5rem;
    }
}

@media screen {
    div.page {
        margin: 1in 1in 1.2in 1in; /* printers usually have a bigger bottom margin*/
    }
}

@media print {
    div.page {
        margin: 10mm; /* Browser will apply the correct margins when it prints */
        margin-top: 1.8in;
        font-size: 1.5rem;
    }

    .buttons {
        display: none;
    }

    #nav {
        display: none;
    }
}
</style>
