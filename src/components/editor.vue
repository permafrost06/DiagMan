<template>
  <div id="app">
    <tiny-editor
      :init="{
        height: 200,

        menubar: false,
        statusbar: false,

        plugins: [
          'advlist',
          'autolink',

          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',

          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
        ],

        toolbar:
          'undo redo | bold italic underline backcolor | outdent indent | removeformat',
      }"
      v-model="value"
    />
  </div>
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
