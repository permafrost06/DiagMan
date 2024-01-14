<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { dateToDMY } from "@/helpers/utils";
import router from "@/router";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLoading = ref(true);
const record = ref();
const error = ref<string | null>(null);
const print = () => window.print();

fetchApi(API_BASE + `/patients/${route.params.id}`).then((res) => {
    isLoading.value = false;
    if (res.success) {
        record.value = res.rows[0];
    } else {
        error.value = res.message || "Something went wrong";
    }
});
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
                <header class="cols-2">
                    <div class="header-left">
                        <p class="logo">The Opinion</p>
                        <p class="bold">Dr. Md. Saiful Islam</p>
                        <p>Cyto and Histopathology Specialist</p>
                        <p>Associate Professor</p>
                        <p>Department of Pathology</p>
                        <p>Rangamati Medical College</p>
                    </div>
                    <div class="header-right">
                        <p class="logo">দি অপিনিয়ন</p>
                        <p><strong>ডা. মোঃ সাইফুল ইসলাম</strong></p>
                        <p>সাইটো এবং হিস্টোপ্যাথলজি বিশেষজ্ঞ</p>
                        <p>সহযোগী অধ্যাপক</p>
                        <p>প্যাথলজি বিভাগ</p>
                        <p>রাঙ্গামাটি মেডিকেল কলেজ</p>
                    </div>
                </header>
                <h1>Invoice</h1>
                <div class="box bold">
                    <div><span class="left">ID No</span>: {{ record.id }}</div>
                </div>
                <div>
                    <span class="left">Patient Name</span>: {{ record.name }}
                </div>
                <div class="box">
                    <div>
                        <span class="left">Age</span>:
                        {{ record.age + " Years" }}
                    </div>
                    <div>Contact No: {{ record.contact }}</div>
                </div>
                <div>
                    <span class="left">Gender</span>:
                    <p class="capital">{{ record.gender }}</p>
                </div>
                <div class="box">
                    <div>
                        <span class="left">Specimen</span>:
                        {{ record.specimen }}
                    </div>
                    <div>
                        Collection Date:
                        {{
                            dateToDMY(
                                new Date(
                                    parseInt(record.sample_collection_date)
                                )
                            )
                        }}
                    </div>
                </div>
                <div>
                    <span class="left">Referred by</span>: {{ record.referer }}
                </div>
                <div class="gap-top bold">
                    <span class="left">Receiving Date</span>:
                    {{ dateToDMY(new Date(parseInt(record.entry_date))) }}
                </div>
                <div class="bold">
                    <span class="left">Delivery Date</span>:
                    {{ dateToDMY(new Date(parseInt(record.delivery_date))) }}
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th class="col-1">Code</th>
                            <th class="col-2">Test Name</th>
                            <th class="col-3 right">Price (BDT)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="test in record.tests" :key="test.id">
                            <td>{{ test.id }}</td>
                            <td>{{ test.name }}</td>
                            <td class="right">{{ test.price / 100 }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Sub total:
                                <span class="spaced">{{
                                    record.total / 100
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Discount:
                                <span class="spaced">{{
                                    record.discount / 100
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Net Payable:
                                <span class="spaced">{{
                                    (record.total - record.discount) / 100
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Advance:
                                <span class="spaced">{{
                                    record.advance / 100
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Due:
                                <span class="spaced">{{
                                    (record.total -
                                        record.discount -
                                        record.advance) /
                                    100
                                }}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <footer class="cols-2">
                    <div class="footer-left">
                        <p>১২৫ কে বি ফজলুল কাদের রোড</p>
                        <p>চকবাজার, চট্টগ্রাম</p>
                        <p>(পিপলস হাসপাতাল-এর পাশে)</p>
                    </div>
                    <div class="footer-right">
                        <p>রিপোর্টের জন্য যোগাযোগ</p>
                        <p>ফোন: <span class="escape">01883569391</span></p>
                        <p>সকাল ১০টা থেকে রাত ০৯টা</p>
                        <p>শুক্রবার বন্ধ</p>
                    </div>
                </footer>
            </div>
        </div>
    </template>
    <div v-else class="f-scr">
        <Loading v-if="isLoading" size="100" />
        <p v-else>{{ error }}</p>
    </div>
</template>

<style lang="scss" scoped>
@import url("https://fonts.maateen.me/solaiman-lipi/font.css");

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
    width: 297mm;
    margin: auto;

    h1 {
        font-family: "Open sans", sans-serif;
    }

    .page {
        font-family: "Open Sans", sans-serif;
        line-height: 1.6rem;
        font-size: 1.15rem;
        --margin-x: 2.5in;
    }

    .cols-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
}

.header-right {
    text-align: right;
    font-family: "SolaimanLipi";
}

h1 {
    margin-top: 1.5rem;
    color: black;
    text-align: center;
    text-transform: uppercase;
    text-decoration: underline;
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
}

.bold {
    font-weight: 700;
}

.right {
    text-align: right;
}

.box {
    display: flex;
    justify-content: space-between;
}

@media screen {
    div.page {
        margin: 10mm var(--margin-x) 0 var(--margin-x); /* Browser will apply the correct margins when it prints */
    }
}

@media print {
    html,
    body {
        height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden;
    }
    div.page {
        margin: 10mm var(--margin-x) 0 var(--margin-x); /* Browser will apply the correct margins when it prints */
    }

    .buttons {
        /**
        * I don't know why but nothing else seems to prevent the extra empty page
        */
        height: 0 !important;
        width: 0 !important;
        opacity: 0;
    }

    #nav {
        display: none;
    }
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

.spaced {
    display: inline-block;
    width: 3rem;
}

.invoice-table {
    margin-top: 2rem;

    border-collapse: collapse;

    thead th {
        border-bottom: 1px solid black;
    }

    tfoot tr:first-of-type td {
        border-top: 1px solid black;
    }

    th {
        font-size: 1rem;
        font-weight: 800;
        text-align: left;
    }

    th.right {
        text-align: right;
    }

    th div {
        margin-bottom: 0.5rem;
    }

    .col-1 {
        width: 15rem;
    }

    .col-2 {
        width: 55rem;
    }

    .col-3 {
        width: 20rem;
    }
}

.gap-top {
    margin-top: 0.5rem;
}

.capital {
    display: inline-block;
    &::first-letter {
        text-transform: capitalize;
    }
}

footer {
    position: absolute;
    top: 63rem;

    div {
        font-family: "SolaimanLipi";
    }

    .footer-right {
        text-align: right;
        font-family: "SolaimanLipi";
        margin-left: 7.8rem;
    }
}

.logo {
    font-size: 1.8em;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.escape {
    font-family: auto;
}
</style>
