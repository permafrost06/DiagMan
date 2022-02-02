<template>
  <tableField v-bind="$attrs">
    <input
      type="checkbox"
      class="check"
      v-model="selected"
      @change="handleSelection"
    />
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
    <small>{{ _id }}</small>
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
  <tableField v-if="edit && aspNote">
    <editField
      fieldLarge
      fieldName="aspNote"
      :fieldValue="aspNote"
      fieldLabel="Aspiration Note"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else-if="aspNote">
    {{ aspNote }}
  </tableField>
  <tableField v-if="edit && me">
    <editField
      fieldLarge
      fieldName="me"
      :fieldValue="me"
      fieldLabel="Microscopic Examination"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else-if="me">
    {{ meShort }}
  </tableField>
  <tableField v-if="edit && impression">
    <editField
      fieldLarge
      fieldName="impression"
      :fieldValue="impression"
      fieldLabel="Impression"
      @value-modified="onModify"
    />
  </tableField>
  <tableField v-else-if="impression">
    {{ impressionShort }}
  </tableField>
  <tableField v-if="edit">
    <button @click="updateRecord">Save</button>
  </tableField>
  <tableField v-else>
    <button @click="enterEdit">Edit</button>
  </tableField>
  <slot></slot>
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
    _id: String,
    patientName: String,
    collDate: String,
    date: String,
    contactNo: String,
    gender: String,
    age: String,
    specimen: String,
    referer: String,
    aspNote: String,
    me: String,
    impression: String,
    tests: Array,
  },
  data() {
    return {
      selected: false,
      modified: false,
      edit: false,
    };
  },
  computed: {
    meShort() {
      return this.me.length > 50 ? this.me.slice(0, 50) + "..." : this.me;
    },
    impressionShort() {
      return this.impression.length > 50
        ? this.impression.slice(0, 50) + "..."
        : this.impression;
    },
    readableDate() {
      return this.date;
    },
    updatedRecord() {
      return {
        _id: this._id,
        patientName: this.patientName,
        collDate: this.collDate,
        date: this.date,
        contactNo: this.contactNo,
        gender: this.gender,
        age: this.age,
        specimen: this.specimen,
        referer: this.referer,
        aspNote: this.aspNote,
        me: this.me,
        impression: this.impression,
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
    handleSelection() {
      if (this.selected) {
        this.$emit("record-selection", {
          operation: "add",
          record_id: this._id,
        });
      } else {
        this.$emit("record-selection", {
          operation: "remove",
          record_id: this._id,
        });
      }
    },
    updateRecord() {
      if (this.modified) {
        this.$emit("record-updated", {
          ...this.updatedRecord,
          tests: JSON.stringify(this.tests),
        });
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
