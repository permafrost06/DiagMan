<template>
  <router-view />
</template>

<script>
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore/lite";

import {
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore/lite";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const ipc = window.ipcRenderer;

export default {
  name: "App",
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

    const sendToFirebase = async (syncObject) => {
      if (syncObject.type == "remove") {
        try {
          await deleteDoc(doc(db, syncObject.db, syncObject.object._id));
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      } else {
        try {
          await setDoc(
            doc(db, syncObject.db, syncObject.object._id),
            syncObject.object
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    };

    const email = "finalconceptmedia@gmail.com";
    const password = "casedb2618914";

    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("login success", user);
      })
      .catch((error) => {
        console.log("login error", error.code, error.message);
      });

    ipc.on("send-to-firebase", async (event, syncObject) => {
      console.log(syncObject);
      if (await sendToFirebase(syncObject)) {
        ipc.send("firebase-success");
      }
    });

    ipc.on("get-from-firebase", async () => {
      const allData = {};
      for (let coll of ["staged", "records", "tests", "templates"]) {
        const collectionSnapshot = await getDocs(collection(db, coll));
        const allDocs = collectionSnapshot.docs.map((doc) => doc.data());
        allData[coll] = allDocs;
      }
      ipc.send("firebase-pull", allData);
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
</style>
