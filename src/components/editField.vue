<template>
  <div>
    <small>{{ fieldLabel }}</small>
    <input type="text" v-model="value" />
  </div>
</template>

<script>
export default {
  name: "editField",
  props: {
    fieldName: String,
    fieldValue: String,
    fieldLabel: String,
  },
  computed: {
    value: {
      get() {
        return this.fieldValue;
      },
      set(value) {
        this.$emit("value-modified", {
          fieldName: this.fieldName,
          value: value,
        });
      },
    },
  },
};
</script>

<style lang="scss">
input {
  width: 100%;
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  height: 1.7rem;
  padding-left: 0.5rem;
}
</style>
