<template>
  <tiny-editor
    :init="{
      height: 200,

      menubar: false,
      statusbar: false,

      toolbar:
        'undo redo | bold italic underline backcolor | outdent indent | removeformat',
    }"
    v-model="value"
  />
</template>

<script>
import Editor from "@tinymce/tinymce-vue";

export default {
  name: "editor",

  components: {
    tinyEditor: Editor,
  },

  props: ["modelValue"],
  emits: ["update:modelValue"],

  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
