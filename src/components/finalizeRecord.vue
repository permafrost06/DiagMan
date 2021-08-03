<template>
  <form>
    <p>ID: {{ _id }}</p>
    <p><span class="bold">Patient Name:</span> {{ patientName }}</p>
    <p><span class="bold">Date:</span> {{ date }}</p>
    <p><span class="bold">Age:</span> {{ age }}</p>
    <p><span class="bold">Specimen:</span> {{ specimen }}</p>
    <p><span class="bold">Referer:</span> {{ referer }}</p>
    <p>
      <span class="bold">Aspiration Note</span>
      <textarea v-model="aspirationNote" />
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
    <button @click="hide" style="width:8rem;">Cancel</button>
  </form>
</template>

<script>
const ipc = window.ipcRenderer;

export default {
  props: {
    _id: String,
    patientName: String,
    date: String,
    age: String,
    specimen: String,
    referer: String,
  },
  data() {
    return {
      aspirationNote: "",
      me: "",
      impression: "",
    };
  },
  methods: {
    addRecord(event) {
      event.preventDefault();
      if (this.aspirationNote && this.me && this.impression)
        ipc.send("add-record", {
          _id: this._id,
          date: this.date,
          patientName: this.patientName,
          age: this.age,
          referer: this.referer,
          specimen: this.specimen,
          aspNote: this.aspirationNote,
          me: this.me,
          impression: this.impression,
        });
      this.$emit("finalized", this._id);
    },
    hide() {
      this.$emit("hide");
    },
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
