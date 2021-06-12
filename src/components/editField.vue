<template>
  <div>
    <small>{{ fieldLabel }}</small>
    <textarea v-if="fieldLarge" class="large" v-model="value" />
    <input v-else type="text" v-model="value" />
  </div>
</template>

<script>
export default {
  name: "editField",
  props: {
    fieldName: String,
    fieldValue: String,
    fieldLabel: String,
    fieldLarge: Boolean,
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
input,
textarea {
  font-family: "Ubuntu";
  width: 100%;
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  height: 1.7rem;
  padding-left: 0.5rem;
}

.large {
  height: 10ch;
}
</style>
