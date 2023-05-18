<script lang="ts" setup>
import LineChart from "@/components/chart/LineChart.vue";
const data1 = [0, 230, 50, 90, 34, 45, 34, 53, 4, 50, 0].map(
    (y: number, x: number) => ({ y, x })
);

const data2 = [0, 10, 50, 120, 70, 90, 5, 53, 40, 80, 0].map(
    (y: number, x: number) => ({ y, x: x * 0.7 })
);

const dataGroups = [data1, data2];
</script>
<template>
    <div class="center">
        <textarea placeholder="Data points"></textarea>
    </div>
    <div class="center">
        <LineChart :data-groups="dataGroups" />
    </div>
</template>

<style scoped>
.center {
    max-width: 600px;
    margin: auto;
}

textarea {
    display: block;
    width: 100%;
}
</style>
