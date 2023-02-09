import { createRouter, createWebHashHistory } from "vue-router";
import Pending from "../views/PendingView.vue";
import Records from "../views/RecordsView.vue";
import patientForm from "../views/PatientFormView.vue";
import finalize from "../views/FinalizeView.vue";
import Report from "../views/ReportView.vue";
import Invoice from "../views/InvoiceView.vue";
import Settings from "../views/SettingsView.vue";
import Summary from "../views/SummaryView.vue";
import syncQueue from "../views/SyncQueueView.vue";
import timestampFix from "../views/timestampFix.vue";

const routes = [
    {
        path: "/",
        name: "Pending",
        component: Pending,
    },
    {
        path: "/records",
        name: "Records",
        component: Records,
    },
    {
        path: "/add-record/:id?",
        name: "AddRecord",
        component: patientForm,
    },
    {
        path: "/finalize/:id",
        name: "finalizeRecord",
        component: finalize,
    },
    {
        path: "/report/:id",
        name: "Report",
        component: Report,
    },
    {
        path: "/invoice/:id",
        name: "Invoice",
        component: Invoice,
    },
    {
        path: "/settings/",
        name: "Settings",
        component: Settings,
    },
    {
        path: "/summary/",
        name: "Summary",
        component: Summary,
    },
    {
        path: "/sync-queue",
        name: "[debug] sync queue",
        component: syncQueue,
    },
    {
        path: "/fix-timestamps",
        name: "[debug] add timestamps",
        component: timestampFix,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
