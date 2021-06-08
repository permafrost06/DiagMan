<template>
  <tableField v-bind="$attrs">
    <input type="checkbox" class="check" />
  </tableField>
  <tableField v-if="edit">
    <editField
      fieldName="patientName"
      :fieldValue="patientName"
      fieldLabel="Patient Name"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else>
    <h5>{{ patientName }}</h5>
    <small>{{ id }}</small>
  </tableField>
  <tableField v-if="edit">
    <editField
      fieldName="date"
      :fieldValue="readableDate"
      fieldLabel="Date"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else>
    {{ readableDate }}
  </tableField>
  <tableField v-if="edit">
    <editField
      fieldName="age"
      :fieldValue="age"
      fieldLabel="Age"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else>
    {{ age }}
  </tableField>
  <tableField v-if="edit">
    <editField
      fieldName="specimen"
      :fieldValue="specimen"
      fieldLabel="Specimen"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else>
    {{ specimen }}
  </tableField>
  <tableField v-if="edit">
    <editField
      fieldName="referer"
      :fieldValue="referer"
      fieldLabel="Referer"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else>
    {{ referer }}
  </tableField>
  <tableField v-if="edit">
    <button @click="updateRecord">Save</button>
  </tableField>
  <tableField v-else>
    <button @click="enterEdit">Edit</button>
  </tableField>
  <tableField>
    <button>Finalize</button>
  </tableField>
</template>

<script>
import tableField from "./tableField.vue";
import editField from "./editField.vue";

export default {
  name: "recordRow",
  components: {
    tableField,
    editField,
  },
  props: {
    id: String,
    patientName: String,
    date: String,
    age: String,
    specimen: String,
    referer: String,
  },
  data() {
    return {
      modified: false,
      edit: false,
    };
  },
  computed: {
    readableDate() {
      return this.date;
    },
    updatedRecord() {
      return {
        id: this.id,
        patientName: this.patientName,
        date: this.date,
        age: this.age,
        specimen: this.specimen,
        referer: this.referer,
      };
    },
  },
  methods: {
    enterEdit() {
      this.edit = true;
    },
    onModify(data) {
      this.modified = true;
      this.updatedRecord[data.fieldName] = data.value;
    },
    updateRecord() {
      if (this.modified) {
        this.$emit("record-updated", this.updatedRecord);
        this.modified = false;
        this.edit = false;
      } else {
        this.edit = false;
      }
    },
  },
};
</script>

<style lang="scss">
button {
  color: white;
  background: #17768d;
  border-radius: 4px;
  height: 1.5rem;
  width: 100%;
  border-style: none;
}
</style>
