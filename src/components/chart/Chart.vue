<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
    initLineChart,
    type DataPoint,
    type LineChart,
    type Level,
} from "./LineChart";
import { initArcChart, type ArcChart } from "./ArcChart";

interface LineChartProps {
    data: DataPoint[][];
    xLabel?: string;
    yLabel?: string;
}
interface ArcChartProps {
    data: number[];
    thickness: number;
}

interface ChartProps {
    type: "line" | "arc";
    data: DataPoint[][] | number[];
    thickness?: number;
    xLabel?: string;
    yLabel?: string;
    xLevel?: Level;
    yLevel?: Level;
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
    if (props.type === "arc") {
        Chart = Chart as ArcChart;
        Chart.setThickness((props as ArcChartProps).thickness);
    } else if (props.type === "line") {
        Chart = Chart as LineChart;
        const props2 = props as LineChartProps;
        if (typeof props2.xLabel !== "undefined") {
            Chart.setLabels({
                x: props2.xLabel,
            });
        }
        if (typeof props2.yLabel !== "undefined") {
            Chart.setLabels({
                y: props2.yLabel,
            });
        }
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
    color: rgb(175, 175, 175);
}
.chart-wrapper {
    overflow: hidden;
    background: white;
}

.chart-svg .y-axis > path,
.chart-svg .axis .tick > line {
    display: none;
}
</style>
