<template>
  <router-view />
</template>

<script>
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
