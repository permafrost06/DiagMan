<script lang="ts" setup>
import Chart from "@/components/chart/Chart.vue";
import { onMounted, ref } from "vue";

const count = ref<number>(5);
const data = ref<number[]>([]);
const dataTxt = ref<string>("");
const thickness = ref<number>(150);
const legends = ref<string[]>([]);

const refresh = () => {
    data.value = generateRandomNumbers(count.value);
    dataTxt.value = data.value.join(" ");
};

function generateRandomNumbers(n: number) {
    const randomNumbers = [];
    let sum = 0;
    legends.value = [];
    for (let i = 0; i < n - 1; i++) {
        const randomNumber = Math.round(Math.random() * (100 - sum));
        randomNumbers.push(randomNumber);
        sum += randomNumber;
        legends.value.push(`Title of ${randomNumber}`);
    }
    randomNumbers.push(100 - sum);
    legends.value.push(`Title of ${100 - sum}`);
    return randomNumbers;
}

onMounted(() => {
    refresh();
});

const applyInput = () => {
    legends.value = [];
    const vals = dataTxt.value.split(" ").map((num) => {
        const final = parseFloat(num) || 0;
        legends.value.push(`Title of ${final}`);
        return final;
    });
    if (vals.length === 0) {
        return;
    }
    data.value = vals;
    dataTxt.value = vals.join(" ");
};
</script>
<template>
    <div class="center flex">
        <textarea rows="4" v-model="dataTxt"></textarea>
        <div>
            <button @click="applyInput">Apply</button>
            <button @click="refresh">Random</button>
        </div>
    </div>

    <div class="center">
        Thinkness:
        <input type="range" v-model="thickness" min="10" max="1000" />
    </div>

    <div class="center">
        <Chart
            type="arc"
            :data="data"
            :thickness="thickness"
            :legends="legends"
            class="arc-chart"
        />
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
.flex {
    display: flex;
    margin-bottom: 30px;
}
textarea {
    display: block;
    flex-grow: 1;
}
button {
    margin: 5px;
    display: block;
    width: 100%;
}
.arc-chart {
    min-height: 400px;
}
</style>
