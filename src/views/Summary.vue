<template>
  <pre>{{ allData }}</pre>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  data() {
    return {
      allData: [],
    };
  },
  beforeMount() {
    this.allData = ipc.sendSync("get-staged", {});
    this.allData.push(...ipc.sendSync("get-records", {}));
  },
};
</script>

<style></style>
