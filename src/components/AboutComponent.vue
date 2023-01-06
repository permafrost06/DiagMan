<template>
  <div class="backdrop">
    <div class="about-box">
      <p>caseDB v{{ packageJsonInfo.version }}</p>
      <p>Developed by Edges Studio/permafrost06</p>
      <button @click="enterDebug" class="debug">Enter Debug Mode</button>
      <button @click="sendClose">Close</button>
    </div>
  </div>
</template>

<script>
let packageJsonInfo = require("../../package.json");
const ipc = window.ipcRenderer;

export default {
  name: "about",
  data() {
    return {
      packageJsonInfo: packageJsonInfo,
    };
  },
  methods: {
    sendClose() {
      this.$emit("close");
    },
    enterDebug() {
      ipc.send("debug-mode-enabled");
    },
  },
};
</script>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  inset: 0 0 0 0;
  background: rgba(0, 0, 0, 0.39);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9;
}

.about-box {
  position: relative;
  padding: 3rem;
  color: black;
  background-color: white;
}

button {
  width: auto;
  padding: 0.25rem 0.75rem;
  margin-top: 0.5rem;
}

button.debug {
  position: absolute;
  bottom: 0;
  right: 0;
  color: white;
  background-color: white;
  border: none;
  border-radius: 0px;

  &:hover {
    color: darkgray;
  }
}
</style>
