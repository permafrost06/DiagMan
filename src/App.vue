<template>
    <password v-show="locked" @unlocked="unlock" />
    <about v-show="about" @close="closeAbout" />
    <router-view />
</template>

<script>
import about from "./components/AboutComponent.vue";
import password from "./components/PasswordComponent.vue";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";
import { getStorage, ref, uploadBytes } from "firebase/storage";

import {
    getDoc,
    deleteDoc,
    doc,
    setDoc,
    getDocs,
    collection,
} from "firebase/firestore/lite";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const ipc = window.ipcRenderer;
const log = require("electron-log");

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
        const firebaseConfig = {
            apiKey: "AIzaSyCwzmIhPhUxB7uFsCHlWhARTiSzMylDn0A",
            projectId: "casedb-29442120",
            storageBucket: "casedb-29442120.appspot.com",
            messagingSenderId: "354561150712",
            appId: "1:354561150712:web:3db5b0d737be49a90bf50d",
        };

        const firebaseApp = initializeApp(firebaseConfig);
        const db = initializeFirestore(firebaseApp);
        const storage = getStorage();

        const sendToFirebase = async (syncObject) => {
            if (syncObject.type == "remove") {
                try {
                    await deleteDoc(
                        doc(db, syncObject.db, syncObject.object._id)
                    );
                } catch (e) {
                    log.error("App.vue: Firestore doc delete error", e);
                    return false;
                }
                return true;
            } else {
                try {
                    await setDoc(
                        doc(db, syncObject.db, syncObject.object._id),
                        syncObject.object
                    );
                } catch (e) {
                    log.error("App.vue: Firestore doc setting error", e);
                    return false;
                }
                return true;
            }
        };

        const email = "finalconceptmedia@gmail.com";
        const password = "casedb2618914";

        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                log.info("App.vue: Firebase login success", user);
                const sms_settings = await getDoc(doc(db, "settings", "sms"));
                ipc.send("sms-settings", sms_settings.data());
            })
            .catch((error) => {
                log.error(
                    "App.vue: Firebase login error",
                    error.code,
                    error.message
                );
            });

        ipc.on("send-to-firebase", async (event, syncObject) => {
            log.info("App.vue: Sync object", syncObject);
            if (await sendToFirebase(syncObject)) {
                ipc.send("firebase-success");
            }
            // try to catch error here and send some other ipc message to return function
        });

        ipc.on("get-from-firebase", async () => {
            const allData = {};
            for (let coll of ["staged", "records", "tests", "templates"]) {
                const collectionSnapshot = await getDocs(collection(db, coll));
                const allDocs = collectionSnapshot.docs.map((doc) =>
                    doc.data()
                );
                allData[coll] = allDocs;
            }
            ipc.send("firebase-pull", allData);
        });

        ipc.on("send-blob", async (event, buffer) => {
            const storageRef = ref(storage, "test.pdf");
            uploadBytes(storageRef, buffer).then((snap) =>
                log.debug("App.vue: file array uploaded!", snap)
            );
        });
    },
};
</script>

<style>
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

small {
    color: #a2a2a2;
    font-size: 0.8rem;
}

.bold {
    font-weight: 800;
}

.sm-button {
    width: auto;
    margin: 1rem;
    padding: 0.25rem 1rem;
}

#nav {
    padding: 1.5rem;
    padding-bottom: 1rem;
    width: 100vw;
    background: #1b91af;
}

#nav a {
    text-decoration: none;
    color: white;
    padding: 1rem;
    padding-bottom: 3rem;
    border: 1px solid white;
    border-radius: 15px;
    border-bottom: none;
}

#nav .router-link-active {
    color: black;
    background: white;
}

.id-search {
    margin-left: 1rem;
    height: 1.7rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid black;
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
    padding: 1em;
}
</style>
