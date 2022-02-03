<template>
  <tableField v-bind="$attrs">
    <input
      type="checkbox"
      class="check"
      v-model="selected"
      @change="handleSelection"
    />
  </tableField>
  <tableField>
    <h5>{{ patientName }}</h5>
    <small>{{ _id }}</small>
  </tableField>
  <tableField>
    {{ dateRearr(date) }}
  </tableField>
  <tableField>
    {{ age }}
  </tableField>
  <tableField>
    {{ specimen }}
  </tableField>
  <tableField>
    {{ referer }}
  </tableField>
  <tableField v-if="aspNote">
    {{ aspNote }}
  </tableField>
  <tableField v-if="me">
    {{ meShort }}
  </tableField>
  <tableField v-if="impression">
    {{ impressionShort }}
  </tableField>
  <tableField>
    <button @click="deleteRecord" class="delete-button">Delete</button>
  </tableField>
  <slot></slot>
</template>

<script>
import tableField from "./tableField.vue";

export default {
  name: "recordRow",
  components: {
    tableField,
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
    _rev: String,
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
  },
  methods: {
    dateRearr(date) {
      const dateArr = date.split("-");
      return `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
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
    deleteRecord() {
      this.$emit("delete", {
        _id: this._id,
        _rev: this._rev,
      });
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

.delete-button {
  width: 3rem;
}
</style>
