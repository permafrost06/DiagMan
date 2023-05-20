<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { initLineChart, type DataPoint, type LineChart } from "./LineChart";
import { initArcChart, type ArcChart } from "./ArcChart";

interface ChartProps {
    type: "line" | "arc";
    data: DataPoint[][] | number[];
    thickness?: number;
}
const props = defineProps<ChartProps>();
let lastType: string = "";

const svg = ref<HTMLElement>();
let Chart: ArcChart | LineChart;

onMounted(() => {
    if (!svg.value) {
        return;
    }
    reInit();
    onResize();
});

watch(props, () => {
    reInit();
    if (!Chart) {
        return;
    }
    Chart.draw(props.data as any);
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
    Chart.draw(props.data as any);
}

function reInit() {
    if (!svg.value) {
        return;
    }
    if (lastType !== props.type) {
        lastType = props.type;
        Chart = {
            line: initLineChart,
            arc: initArcChart,
        }[props.type](svg.value);
    }
    if (typeof props.thickness === "number") {
        //@ts-ignore
        Chart.setThickness(props.thickness);
    }
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
