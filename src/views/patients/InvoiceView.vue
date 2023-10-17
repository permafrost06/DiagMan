<script setup lang="ts">
import Loading from "@/Icons/Loading.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { dateToDMY } from "@/helpers/utils";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLoading = ref(true);
const record = ref();
const error = ref<string | null>(null);
const print = window.print;

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
            <RouterLink
                :to="{
                    name: 'patients.edit',
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
                    <div class="header-left">
                        <p class="logo">The Opinion</p>
                        <p><strong>Dr. Md. Saiful Islam</strong></p>
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
                            <td class="right">{{ test.price }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Sub total:
                                <span class="spaced">{{ record.total }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Discount:
                                <span class="spaced">{{
                                    record.discount
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Net Payable:
                                <span class="spaced">{{
                                    record.total - record.discount
                                }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Advance:
                                <span class="spaced">{{ record.advance }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td class="right">
                                Due:
                                <span class="spaced">{{
                                    record.total -
                                    record.discount -
                                    record.advance
                                }}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <footer>
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
    width: 297mm;
}

.page {
    font-family: "Calibri";
    line-height: 1.6rem;

    margin: 0;
    /* you don't really have to explicitly set it to 0 unless it's already set to something else */
    font-size: 1.25rem;
}

header {
    display: flex;
    justify-content: space-between;
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
    font-weight: 800;
}

.left {
    display: inline-block;
    width: 9rem;
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
        margin: 10mm 2.5in 0 2.5in; /* Browser will apply the correct margins when it prints */
    }
}

@media print {
    div.page {
        margin: 10mm 2.5in 0 2.5in; /* Browser will apply the correct margins when it prints */
    }

    button {
        display: none;
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
    top: 60rem;
    display: flex;
    justify-content: space-between;

    div {
        font-family: "SolaimanLipi";
    }

    .footer-right {
        text-align: right;
        margin-left: 12.6rem;
        font-family: "SolaimanLipi";
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
