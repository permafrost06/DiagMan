import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";

import {
    getDoc,
    deleteDoc,
    doc,
    setDoc,
    getDocs,
    collection,
} from "firebase/firestore/lite";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const log = require("electron-log");

const firebaseConfig = {
    apiKey: "AIzaSyCwzmIhPhUxB7uFsCHlWhARTiSzMylDn0A",
    projectId: "casedb-29442120",
    storageBucket: "casedb-29442120.appspot.com",
    messagingSenderId: "354561150712",
    appId: "1:354561150712:web:3db5b0d737be49a90bf50d",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp);

export const sendToFirebase = async (syncObject) => {
    if (syncObject.type == "remove") {
        try {
            await deleteDoc(doc(db, syncObject.db, syncObject.object._id));
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

export const firebaseSignIn = async () => {
    await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            log.info("App.vue: Firebase login success", user);
        })
        .catch((error) => {
            log.error(
                "App.vue: Firebase login error",
                error.code,
                error.message
            );
        });
};

export const getSMSSettings = async () => {
    try {
        const sms_settings = await getDoc(doc(db, "settings", "sms"));
        return sms_settings.data();
    } catch (e) {
        log.error("App.vue: SMS or Firestore error", e);
        throw e;
    }
};

export const getAllFirestoreData = async () => {
    try {
        const allData = {};
        for (let coll of ["staged", "records", "tests", "templates"]) {
            const collectionSnapshot = await getDocs(collection(db, coll));
            const allDocs = collectionSnapshot.docs.map((doc) => doc.data());
            allData[coll] = allDocs;
        }
        return allData;
    } catch (error) {
        log.error(error);
    }
};

export const checkFirestoreQuota = async () => {
    try {
        await getDoc(doc(db, "settings", "sms"));
    } catch (e) {
        log.warn("Firestore error: ", e);
        throw new Error("Firestore quota reached", { cause: e });
    }
};

export const connectedToInternet = async () => {
    try {
        await fetch(
            // fetch random public image to check if internet connection is active
            "https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg",
            { cache: "no-store" }
        );
    } catch (e) {
        throw new Error("No internet connection", { cause: e });
    }
};
