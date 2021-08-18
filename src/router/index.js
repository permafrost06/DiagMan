import { createRouter, createWebHashHistory } from "vue-router";
import Pending from "../views/Pending.vue";
import Records from "../views/Records.vue";
import addNew from "../views/addNew.vue";
import finalize from "../views/finalize/finalize.vue";
import Report from "../views/report/Report.vue";
import Invoice from "../views/invoice/Invoice.vue";
import Settings from "../views/Settings.vue";

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
    path: "/add-record",
    name: "AddRecord",
    component: addNew,
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
    path: "/invoice/",
    name: "Invoice",
    component: Invoice,
  },
  {
    path: "/settings/",
    name: "Settings",
    component: Settings,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
