<script lang="ts" setup>
import Chart from "@/components/chart/Chart.vue";
import type { DataPoint } from "@/components/chart/LineChart";
import { onMounted, ref } from "vue";

const count1 = ref<number>(8);
const maxX1 = ref<number>(10);
const maxY1 = ref<number>(100);

const count2 = ref<number>(10);
const maxX2 = ref<number>(10);
const maxY2 = ref<number>(100);

const dataGroups = ref<DataPoint[][]>([[], []]);

const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const reCalc1 = () => {
    const arr = [];
    for (let i = 0; i < count1.value; i++) {
        arr.push({
            x: random(0, maxX1.value),
            y: random(0, maxY1.value),
        });
    }
    arr.sort((a, b) => a.x - b.x);
    dataGroups.value[0] = arr;
};
const reCalc2 = () => {
    const arr = [];
    for (let i = 0; i < count2.value; i++) {
        arr.push({
            x: random(0, maxX2.value),
            y: random(0, maxY2.value),
        });
    }
    arr.sort((a, b) => a.x - b.x);
    dataGroups.value[1] = arr;
};
onMounted(() => {
    reCalc1();
    reCalc2();
});
</script>
<template>
    <div class="center">
        <div class="input-group">
            <div>Count</div>
            <div>Max X value</div>
            <div>Max Y Value</div>
        </div>
        <div class="input-group">
            <input
                type="number"
                placeholder="Item count"
                v-model="count1"
                @change="reCalc1"
            />
            <input
                type="number"
                placeholder="Max X"
                v-model="maxX1"
                @change="reCalc1"
            />
            <input
                type="number"
                placeholder="Max Y"
                v-model="maxY1"
                @change="reCalc1"
            />
        </div>

        <div class="input-group">
            <input
                type="number"
                placeholder="Item count"
                v-model="count2"
                @change="reCalc2"
            />
            <input
                type="number"
                placeholder="Max X"
                v-model="maxX2"
                @change="reCalc2"
            />
            <input
                type="number"
                placeholder="Max Y"
                v-model="maxY2"
                @change="reCalc2"
            />
        </div>
    </div>
    <div class="center">
        <Chart type="line" :data="dataGroups" />
    </div>
    <div class="center input-group">
        <button @click="reCalc1">Refresh 1</button>
        <button
            @click="
                () => {
                    reCalc1();
                    reCalc2();
                }
            "
        >
            Refresh Both
        </button>
        <button @click="reCalc2">Refresh 2</button>
    </div>
</template>

<style scoped>
h3 {
    margin-top: 20px;
    padding: 0;
}
.center {
    max-width: 600px;
    margin: auto;
}

.input-group {
    display: flex;
    gap: 10px;
}
.input-group > * {
    flex-grow: 1;
    margin-top: 10px;
}
</style>
