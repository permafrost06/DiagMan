<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { initLineChart, type DataPoint, type LineChart } from "./LineChart";

interface ChartProps {
    type: "line";
    data: DataPoint[][];
}
const props = defineProps<ChartProps>();

const svg = ref<HTMLElement>();
let Chart: LineChart;

onMounted(() => {
    if (!svg.value) {
        return;
    }
    Chart = initLineChart(svg.value);
    onResize();
});

watch(props, () => {
    if (!Chart) {
        return;
    }
    Chart.draw(props.data);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
});

function onResize() {
    if (!svg.value || !Chart) {
        return;
    }
    let height = svg.value.parentElement?.clientHeight || 0;
    let width = svg.value.parentElement?.clientWidth || 0;

    Chart.resize(height, width);
    Chart.draw(props.data);
}
</script>
<template>
    <div class="chart-wrapper">
        <svg class="chart-svg" ref="svg"></svg>
    </div>
</template>

<style>
.chart-svg {
    display: block;
    overflow: visible;
}
.chart-wrapper {
    overflow: hidden;
}
</style>
