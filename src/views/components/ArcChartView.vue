<script lang="ts" setup>
import Chart from "@/components/chart/Chart.vue";
import { ref } from "vue";

const count = ref<number>(5);
const data = ref<number[]>(generateRandomNumbers(5));

const refresh = () => {
    data.value = generateRandomNumbers(count.value);
};

function generateRandomNumbers(n: number) {
    const randomNumbers = [];
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
        const randomNumber = Math.random() * (100 - sum);
        randomNumbers.push(randomNumber);
        sum += randomNumber;
    }
    randomNumbers.push(100 - sum);
    return randomNumbers;
}
</script>
<template>
    <div class="center input-group">
        <input
            type="number"
            placeholder="Item count"
            v-model="count"
            @change="refresh"
        />
        <button @click="refresh">Refresh</button>
    </div>

    <div class="center">
        <Chart type="arc" :data="data" :thickness="170" class="arc-chart" />
    </div>
</template>

<style scoped>
h3 {
    margin-top: 20px;
    padding: 0;
}
.center {
    max-width: 800px;
    margin: auto;
}

.input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 40px;
}
.input-group > * {
    flex-grow: 1;
    margin-top: 10px;
}

.arc-chart {
    min-height: 400px;
}
</style>
