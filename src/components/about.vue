<template>
  <div class="backdrop">
    <div class="about-box">
      <p>caseDB {{ packageJsonInfo.version }}</p>
      <p>Developed by Edges Studio/permafrost06</p>
      <button @click="sendClose">Close</button>
    </div>
  </div>
</template>

<script>
let packageJsonInfo = require("../../package.json");

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
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0 0 0 0;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9;
}

.about-box {
  padding: 3rem;
  color: black;
  background-color: white;
}
</style>
