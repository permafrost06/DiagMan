<script lang="ts" setup>
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { onMounted, ref, watch } from "vue";

interface LayoutBuilderProps {
    modelValue?: any;
}

const props = defineProps<LayoutBuilderProps>();

const emit = defineEmits<{
    (e: "update:modelValue", contents: any): void;
}>();

const editorEl = ref<HTMLElement>();

let editor: Quill;
/**
 * As we are watching for prop change and emiting the change
 * event from here, this might trigger infinite loop like
 * scenario.
 * To prevent this behaviour we'll only update the contents
 * if the change was not from here
 */
let updatedHere: boolean = false;

onMounted(() => {
    if (!editorEl.value || editor) {
        return;
    }
    editor = new Quill(editorEl.value, {
        // debug: "info",
        modules: {
            // toolbar: "#toolbar",
        },
        placeholder: "Compose an epic...",
        theme: "snow",
    });

    editor.on("text-change", () => {
        updatedHere = true;
        emit("update:modelValue", editor.getContents());
    });
});

watch(props, () => {
    if (!editor) {
        return;
    }
    if (updatedHere) {
        updatedHere = false;
        return;
    }
    editor.setContents(props.modelValue);
});
</script>

<template>
    <div class="layout-builder" ref="editorEl"></div>
</template>

<style>
.layout-builder {
    border: 1px solid #a7a7a7;
}
.ql-editor {
    min-height: 500px;
}
</style>
