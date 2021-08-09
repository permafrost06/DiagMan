<template>
  <form>
    <p>ID: {{ record._id }}</p>
    <p><span class="bold">Patient Name:</span> {{ record.patientName }}</p>
    <p><span class="bold">Date:</span> {{ record.date }}</p>
    <p><span class="bold">Age:</span> {{ record.age }}</p>
    <p><span class="bold">Specimen:</span> {{ record.specimen }}</p>
    <p><span class="bold">Referer:</span> {{ record.referer }}</p>
    <p>
      <span class="bold">Aspiration Note</span>
      <textarea v-model="aspNote" />
    </p>
    <p>
      <span class="bold">Microscopic Examination</span>
      <textarea v-model="me" />
    </p>
    <p>
      <span class="bold">Impression</span>
      <textarea v-model="impression" />
    </p>
    <button @click="addRecord" style="width:8rem;">Add</button>
    <router-link :to="{ name: 'Pending' }">
      <button style="width:8rem;">Cancel</button>
    </router-link>
  </form>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  data() {
    return {
      aspNote: "",
      me: "",
      impression: "",
      record: {},
    };
  },
  methods: {
    addRecord(event) {
      event.preventDefault();
      if (this.aspNote && this.me && this.impression)
        ipc.send("add-record", {
          _id: this.record._id,
          date: this.record.date,
          patientName: this.record.patientName,
          age: this.record.age,
          referer: this.record.referer,
          specimen: this.record.specimen,
          aspNote: this.aspNote,
          me: this.me,
          impression: this.impression,
        });
      this.$router.push({ name: "Report", params: { id: this.record._id } });
    },
  },
  beforeMount() {
    this.record = ipc.sendSync("get-staged-rcd", this.$route.params.id);
  },
};
</script>

<style lang="scss" scoped>
textarea {
  font-family: "Ubuntu";
  width: 50vw;
  height: 10ch;
  width: 100%;
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  padding-left: 0.5rem;
}

.bold {
  font-weight: 800;
}

* {
  margin: 0.5rem 0.25rem;
}
</style>
