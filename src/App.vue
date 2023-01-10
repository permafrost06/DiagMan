<template>
    <password v-show="locked" @unlocked="unlock" />
    <about v-show="about" @close="closeAbout" />
    <router-view />
</template>

<script>
import about from "./components/AboutComponent.vue";
import password from "./components/PasswordComponent.vue";
import {
    firebaseSignIn,
    getSMSSettings,
    sendToFirebase,
    getAllFirestoreData,
} from "./firebase";

const log = require("electron-log");
const ipc = window.ipcRenderer;

export default {
    name: "App",
    components: {
        about,
        password,
    },
    data() {
        return {
            about: false,
            locked: true,
        };
    },
    methods: {
        closeAbout() {
            this.about = false;
        },
        unlock() {
            this.locked = false;
        },
    },
    beforeMount() {
        ipc.on("open-settings", () => {
            this.$router.push({ name: "Settings" });
        });
        ipc.on("show-pending-patients", () => {
            this.$router.push({ name: "Pending" });
        });
        ipc.on("show-past-reports", () => {
            this.$router.push({ name: "Records" });
        });
        ipc.on("show-monthly-summary", () => {
            this.$router.push({ name: "Summary" });
        });
        ipc.on("show-sync-queue", () => {
            this.$router.push({ name: "[debug] sync queue" });
        });
        ipc.on("show-about", () => {
            this.about = true;
        });
    },
    async mounted() {
        try {
            await firebaseSignIn();
        } catch (e) {
            log.error(e);
        }

        try {
            ipc.send("sms-settings", await getSMSSettings());
        } catch (e) {
            log.error(e);
        }

        ipc.on("send-to-firebase", async (event, syncObject) => {
            log.info("App.vue: Sync object", syncObject);
            try {
                if (await sendToFirebase(syncObject)) {
                    ipc.send("firebase-success");
                }
            } catch (error) {
                log.error(error);
            }
        });

        ipc.on("get-from-firebase", async () => {
            try {
                ipc.send("firebase-pull", await getAllFirestoreData());
            } catch (error) {
                log.error(error);
            }
        });
    },
};
</script>

<style lang="scss">
@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-BoldItalic.ttf") format("truetype");
    font-weight: bold;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-Italic.ttf") format("truetype");
    font-weight: normal;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-Bold.ttf") format("truetype");
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-Light.ttf") format("truetype");
    font-weight: 300;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-LightItalic.ttf") format("truetype");
    font-weight: 300;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-Medium.ttf") format("truetype");
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-Regular.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "Ubuntu";
    src: url("~@/assets/Ubuntu-MediumItalic.ttf") format("truetype");
    font-weight: 500;
    font-style: italic;
    font-display: swap;
}

*,
*:before,
*:after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

#app {
    font-family: "Ubuntu", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1 {
    color: #17768d;
    margin-bottom: 1rem;
}

h5 {
    color: #17768d;
    font-weight: Bold;
    font-size: 1rem;
}

button {
    color: white;
    background: #17768d;
    border-radius: 4px;
    border-style: none;
    margin: 1rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;

    &:disabled {
        color: gray;
        background: #0f3842;
    }
}

button.secondary {
    color: #17768d;
    background: white;
    border: 1px solid #17768d;

    &:disabled {
        color: gray;
        background: white;
    }
}

small {
    color: #a2a2a2;
    font-size: 0.8rem;
}

.bold {
    font-weight: 800;
}

.id-search {
    margin-left: 1rem;
    height: 1.7rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid black;
}

table td,
table th {
    overflow: hidden;
}

table {
    margin-top: 20px;
    border-top: 2px solid #c0c0c080;
    border-collapse: collapse;
    table-layout: fixed;
    width: 97vw;

    thead {
        border-bottom: 2px solid #c0c0c080;
    }

    margin-inline: 1vw;
}

.buttons-cell {
    text-align: center;

    button {
        margin: 0.2rem 0;
    }
}

thead {
    border-bottom: 1px solid #c4c4c4;
    box-shadow: 0 6px 4px -4px rgba(0, 0, 0, 0.15);
}

th {
    font-size: 1.2rem;
    font-weight: 400;
    text-align: left;
    padding: 0.5rem 1rem;
}

th div {
    margin-bottom: 0.5rem;
}

tbody tr {
    border-bottom: 2px solid #c0c0c080;
}

td {
    padding: 0.2rem 0.5rem;
}

.svg-container {
    position: absolute;
    display: inline-block;
}

.action-buttons-holder {
    display: flex;
    justify-content: center;
    gap: 1rem;

    button {
        font-size: 1.3rem;
        height: auto;
        width: auto;
        padding: 0.5rem 1rem;
    }
}

.heading {
    margin: 1rem;
    display: inline-block;
}
</style>
