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
import { initDonutChart, type DonutChart } from "./DonutChart";

interface LineChartProps {
    data: DataPoint[][];
    xLabel?: string;
    yLabel?: string;
    legends?: string[];
}
interface ArcChartProps {
    data: number[];
    thickness: number;
    legends?: string[];
}

interface DonutChartProps {
    data: number[];
    thickness: number;
    legends?: string[];
}

interface ChartProps {
    type: "line" | "arc" | "donut";
    data: DataPoint[][] | number[];
    thickness?: number;
    xLabel?: string;
    yLabel?: string;
    xLevel?: Level;
    yLevel?: Level;
    legends?: string[];
}

const props = defineProps<ChartProps>();
let lastType: string = "";

const svg = ref<HTMLElement>();
let Chart: ArcChart | LineChart | DonutChart;

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
            donut: initDonutChart,
        }[props.type](svg.value);
    }
    if (props.type === "arc") {
        arcChartOpts();
    } else if (props.type === "line") {
        lineChartOpts();
    } else if (props.type === "donut") {
        donutChartOpts();
    }
}

function lineChartOpts() {
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

    if (typeof props2.legends !== "undefined") {
        Chart.setLegends(props2.legends);
    }
}

function arcChartOpts() {
    Chart = Chart as ArcChart;
    const props2 = props as ArcChartProps;
    Chart.setThickness(props2.thickness);
    if (typeof props2.legends !== "undefined") {
        Chart.setLegends(props2.legends);
    }
}

function donutChartOpts() {
    Chart = Chart as DonutChart;
    const props2 = props as DonutChartProps;
    Chart.setThickness(props2.thickness);
    if (typeof props2.legends !== "undefined") {
        Chart.setLegends(props2.legends);
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
    height: 400px;
}
.chart-wrapper {
    overflow: hidden;
    background: white;
}

/** LineChart Design */
.chart-svg .axis-labels text {
    color: rgb(83, 83, 83);
    font-size: 10px;
}

.chart-svg .x-level {
    display: none;
}

.chart-svg .y-level {
    stroke-dasharray: 4 3;
    stroke: #e9e9e9;
}

.chart-svg .data-label-bg {
    fill: black;
    border-radius: 5px;
    filter: drop-shadow(0 0 2px black);
}
.chart-svg .data-label {
    color: rgb(255, 255, 255);
}

.chart-svg .divider-line {
    stroke: rgb(209, 209, 209);
    stroke-dasharray: 4 2;
}
</style>
