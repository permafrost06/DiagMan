import { createApp } from "vue";
import { createPinia } from "pinia";

import { sync } from "./helpers/offline";
import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

sync();
