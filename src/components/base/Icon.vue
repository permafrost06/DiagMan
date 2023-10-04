<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { SVGAttributes } from "vue";

interface Props {
    viewBox?: string | number;
    class?: any;
    height?: SVGAttributes["height"];
    width?: SVGAttributes["width"];
    size?: SVGAttributes["height"];
}
const props = defineProps<Props>();

const refViewBox = props.viewBox || props.size || 20;

const viewBox: string =
    typeof refViewBox === "number" || refViewBox.indexOf(" ") < 0
        ? `0 0 ${refViewBox} ${refViewBox}`
        : refViewBox;

const height = props.height || props.size;
const width = props.width || props.size;
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        :viewBox="viewBox"
        :height="height"
        :width="width"
        :class="props.class"
    >
        <slot />
    </svg>
</template>
