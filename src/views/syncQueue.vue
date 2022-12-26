<template>
  <h1>Sync Queue</h1>
  <button @click="loadQueue">Refresh</button>
  <table>
    <tr v-for="syncObj in queue" :key="syncObj.object._id">
      <td>{{ syncObj.type }}</td>
      <td>{{ syncObj.object._id }}</td>
      <td>
        <button @click="dequeue(syncObj.object._id)">Dequeue</button>
      </td>
    </tr>
  </table>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  data() {
    return {
      queue: [],
    };
  },
  methods: {
    dequeue(id) {
      ipc.send("remove-queue-item", id);
      this.loadQueue();
    },
    loadQueue() {
      this.queue = [];
      this.queue = ipc.sendSync("get-sync-queue");
    },
  },
  mounted() {
    this.loadQueue();
  },
};
</script>

<style lang="scss" scoped>
button {
  width: auto;
  padding: 0rem 0.5rem;
}
</style>
