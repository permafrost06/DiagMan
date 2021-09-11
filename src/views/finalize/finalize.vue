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
        </p>
        <p>
          <select v-if="organ" @change="template">
            <option value="" selected hidden>Choose Template</option>
            <optgroup
              v-for="organ in filteredTemps"
              :key="organ._id"
              :label="organ.organName"
            >
              <option
                :value="template._id"
                v-for="template in organ.templates"
                :key="template._id"
                >{{ template.impression }}</option
              >
            </optgroup>
          </select>
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
      templates: [
        {
          _id: "parotid",
          organName: "Parotid",
          templates: [
            {
              _id: "0001",
              name: "Left Parotid Swelling",
              aspNote: "On aspiration blood mixed material came out.",
              me:
                "Smears showed cellular material composed of many scattered and clusters of benign ductal epithelial cells along with lymphocytes and histiocytes, in the background of scanty blood. No epithelioid or malignant cell was seen.",
              impression: "Left parotid swelling(FNA): Sialadenitis",
            },
            {
              _id: "0002",
              name: "Right parotid swelling",
              aspNote: "On aspiration, 0.5 ml pus like material came out.",
              me:
                "Smear showed numerous neutrophils, lymphocytes in the background of necrosis. No epithelioid or malignant cell was seen.",
              impression:
                "Right parotid swelling (FNA): Suppurative inflammation",
            },
          ],
        },
        {
          _id: "lymph",
          organName: "Lymph",
          templates: [
            {
              _id: "0001",
              name: "Left cervical lymph nodes",
              aspNote: "On aspiration, blood mixed cellular material came out.",
              me:
                "Smear showed cellular material composed of polymorphous population of lymphoid cells along cells with much enlarged nucleus with prominent nucleoli often they were binucleated in the background of scanty blood. No epithelioid cell was seen.",
              impression: "Left cervical lymph nodes(FNA)",
            },
            {
              _id: "0002",
              name: "Right cervical lymph nodes",
              aspNote: "On aspiration, caseous necrotic material came out.",
              me:
                "Smear showed many scattered and aggregates of epithelioid cells along with histiocytes, lymphocytes in the background of caseation necrosis. No malignant cell was seen.",
              impression:
                "Right cervical lymph nodes(FNA):Caseating granuloma Suggestive of Tuberculosis",
            },
            {
              _id: "0003",
              name: "Left cervical lymph node",
              aspNote: "On aspiration necrotic cellular material came out.",
              me:
                "Smears showed cellular material composed of many scattered and small to large clusters of spindle to polygonal malignant squamous epithelial cells with pleomorphic, enlarged and hyperchromatic nucleus in the background of necrosis and plenty of acute inflammatory cells and lymphocytes.",
              impression:
                "Left cervical lymph node (FNA): Metastatic squamous cell carcinoma",
            },
          ],
        },
        {
          _id: "forearm",
          organName: "Forearm",
          templates: [
            {
              _id: "0001",
              name: "Right forearm swelling",
              aspNote: "On aspiration blood mixed material came out.",
              me:
                "Smears showed few clusters of benign fibroblasts, adipocytes along with many lymphocytes in a background of blood. No epithelioid or malignant cell was seen.",
              impression:
                "Right forearm swellinlling(FNA):Benign mesenchymal lesion",
            },
          ],
        },
      ],
    };
  },
  computed: {
    filteredTemps() {
      return this.templates.filter((organ) => organ._id == this.organ);
    },
  },
  methods: {
    template(event) {
      let tempID = event.target.value;
      let template = this.templates
        .filter((organ) => organ._id == this.organ)[0]
        .templates.filter((temp) => temp._id == tempID)[0];
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

* {
  margin: 0.5rem 0.25rem;
}

.row {
  display: flex;
}

.row-left {
  width: 40vw;
}
</style>
