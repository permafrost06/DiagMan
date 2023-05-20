<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import LineChart, { type DataPoint } from "./LineChart.vue";
interface ChartProps {
    type: "line";
    data: DataPoint[][];
}
defineProps<ChartProps>();

const chartMap = {
    line: LineChart,
};
</script>
<template>
    <component :data-groups="data" :is="chartMap[type]" />
</template>
