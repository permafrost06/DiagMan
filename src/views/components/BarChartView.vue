<script setup lang="ts">
import Container from "@/components/dev/Container.vue";
import TextArea from "@/components/dev/TextArea.vue";
import Btn from "@/components/dev/Btn.vue";
import Chart from "@/components/chart/Chart.vue";
import type { BarChartData } from "@/components/chart/BarChart";
import { onMounted, ref } from "vue";

let groups = 5;

const dataText = ref<string>("");
const data = ref<BarChartData[]>([]);
const legends = ref<string[]>([]);

onMounted(() => {
    genRandom();
});

function genRandom() {
    const legendsL: string[] = [];
    const dataL: BarChartData[] = [];
    let text = "";
    for (let i = 0; i < groups; i++) {
        const levels = Math.round(Math.random() * 6) + 1;
        const data = [];
        for (let j = 0; j < levels; j++) {
            data.push(Math.round(Math.random() * 1000));
            if (legendsL.length === j) {
                legendsL.push(`Legend ${j + 1}`);
            }
        }
        text += data.join(" ") + "\n";
        dataL.push({
            values: data,
            label: `Label ${i + 1}`,
        });
    }
    data.value = dataL;
    dataText.value = text;
    legends.value = legendsL;
}

const applyInput = () => {
    const legendsL: string[] = [];
    const dataL: BarChartData[] = [];
    let text = "";
    dataText.value.split("\n").forEach((group, i) => {
        const data: number[] = [];
        group.split(" ").forEach((val, j) => {
            const valF = parseFloat(val);
            if (isNaN(valF)) {
                return;
            }
            data.push(valF);
            if (legendsL.length === j) {
                legendsL.push(`Legend ${j + 1}`);
            }
        });
        text += data.join(" ") + "\n";
        dataL.push({
            values: data,
            label: `Label ${i + 1}`,
        });
        return 0;
    });
    if (dataL.length === 0) {
        return;
    }
    data.value = dataL;
    dataText.value = text;
    legends.value = legendsL;
};
</script>

<template>
    <Container>
        <TextArea placeholder="Data" v-model="dataText"> </TextArea>
        <Btn class="my-sm" @click="applyInput">Apply</Btn>
        <Btn class="m-sm" @click="genRandom">Random</Btn>
    </Container>
    <Container>
        <Chart type="bar" :data="data" :legends="legends" />
    </Container>
</template>
