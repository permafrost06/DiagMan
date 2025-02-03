<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { initBarChart, BarChart, BarChartData } from "./BarChart";
import { DonutChart, DonutChartData, initDonutChart } from "./DonutChart";

interface ChartProps {
    type: "bar" | "donut";
    data: BarChartData | DonutChartData;
}

const props = defineProps<ChartProps>();
let lastType: string = "";

const svg = ref<HTMLElement>();
let Chart: BarChart | DonutChart;

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
            bar: initBarChart,
            donut: initDonutChart,
        }[props.type](svg.value);
    }
}
</script>
<template>
    <div class="chart-wrapper">
        <svg class="chart-svg" ref="svg"></svg>
    </div>
</template>

<style scoped>
.chart-svg {
    display: block;
    overflow: visible;
    color: rgb(175, 175, 175);
    height: 400px;
}
.chart-wrapper {
    overflow: hidden;
    background: white;
}
</style>
