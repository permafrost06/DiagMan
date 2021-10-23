<template>
  <form>
    <div class="row">
      <div class="row-left">
        <p>ID: {{ record._id }}</p>
        <p><span class="bold">Patient Name:</span> {{ record.patientName }}</p>
        <p><span class="bold">Date:</span> {{ record.date }}</p>
        <p><span class="bold">Age:</span> {{ record.age }}</p>
        <p><span class="bold">Specimen:</span> {{ record.specimen }}</p>
        <p><span class="bold">Referer:</span> {{ record.referer }}</p>
      </div>
      <div class="row-right">
        <h3>Templates</h3>
        <p>
          <select v-model="organ">
            <option value="" selected hidden>Choose Organ</option>
            <option
              :value="organ._id"
              v-for="organ in templates"
              :key="organ._id"
            >
              {{ organ.organName }}
            </option>
          </select>
          <input
            type="text"
            ref="newOrganField"
            class="new-organ-field"
            v-model="newOrganName"
            @keydown.enter="addOrgan"
          />
          <button class="organ-button" @click="addOrgan">Add Organ</button>
        </p>
        <p>
          <select v-if="organ" @change="template">
            <option value="" selected hidden>Choose Template</option>
            <optgroup
              v-for="organ in filteredTemps"
              :key="organ._id"
              :label="organ.organName"
            >
              <option value="" disabled v-if="!organ.templates.length"
                >There are no templates for this organ</option
              >
              <option
                :value="template._id"
                v-for="template in organ.templates"
                :key="template._id"
                >{{ template.name }}</option
              >
            </optgroup>
          </select>
          <br />
          <input
            type="text"
            ref="newTemplateField"
            v-model="newTemplateName"
            class="new-organ-field new-template"
            @keydown.enter="addTemplate"
          />
          <button class="organ-button" @click="addTemplate" v-if="templateID">
            Save Template As
          </button>
          <button
            class="organ-button"
            @click="updateTemplate"
            v-if="templateID"
          >
            Update Template
          </button>
          <button
            class="organ-button"
            @click="deleteTemplate"
            v-if="templateID"
          >
            Delete Template
          </button>
        </p>
      </div>
    </div>
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
      organ: "",
      templates: [],
      newOrganName: "",
      newTemplateName: "",
      templateID: 0,
    };
  },
  computed: {
    filteredTemps() {
      return this.templates.filter((organ) => organ._id == this.organ);
    },
  },
  methods: {
    template(event) {
      this.templateID = event.target.value;
      let template = this.templates
        .filter((organ) => organ._id == this.organ)[0]
        .templates.filter((temp) => temp._id == this.templateID)[0];
      this.aspNote = template.aspNote;
      this.me = template.me;
      this.impression = template.impression;
    },
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
    addOrgan(event) {
      event.preventDefault();
      if (this.newOrganName == "") {
        this.$refs.newOrganField.style.display = "inline-block";
        this.$refs.newOrganField.focus();
      } else {
        ipc.send("add-organ", this.newOrganName);
        this.$refs.newOrganField.style.display = "none";
        this.newOrganName = "";
        this.templates = ipc.sendSync("get-templates");
      }
    },
    addTemplate(event) {
      event.preventDefault();
      if (this.newTemplateName == "") {
        this.$refs.newTemplateField.style.display = "block";
        this.newTemplateName = this.impression;
        this.$refs.newTemplateField.focus();
      } else {
        ipc.send("add-template", this.organ, {
          name: this.newTemplateName,
          aspNote: this.aspNote,
          me: this.me,
          impression: this.impression,
        });
        this.$refs.newTemplateField.style.display = "none";
        this.newTemplateName = "";
        this.templates = ipc.sendSync("get-templates");
      }
    },
    updateTemplate(event) {
      event.preventDefault();
      ipc.send("update-template", this.organ, this.templateID, {
        name: this.newTemplateName,
        aspNote: this.aspNote,
        me: this.me,
        impression: this.impression,
      });
    },
    deleteTemplate(event) {
      event.preventDefault();
      ipc.send("delete-template", this.organ, this.templateID);
    },
  },
  beforeMount() {
    this.record = ipc.sendSync("get-staged-rcd", this.$route.params.id);
    this.templates = ipc.sendSync("get-templates");
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

* {
  margin: 0.5rem 0.25rem;
}

.row {
  display: flex;
}

.row-left {
  width: 40vw;
}

.organ-button {
  display: inline-block;
  width: auto;
  padding: 0 0.5rem;
}

.new-organ-field {
  display: none;
  width: 10rem;
}

.new-template {
  width: 25rem;
}
</style>
