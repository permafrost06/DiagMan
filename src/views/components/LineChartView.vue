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
    let xVal = "";
    let yVal = "";

    const arr = [];
    for (let i = 0; i < count1.value; i++) {
        const x = random(0, maxX1.value);
        const y = random(0, maxY1.value);
        arr.push({ x, y });
        xVal += " " + x.toString();
        yVal += " " + y.toString();
    }
    arr.sort((a, b) => a.x - b.x);
    dataGroups.value[0] = arr;
    x1Val.value = xVal;
    y1Val.value = yVal;
};

const reCalc2 = () => {
    let xVal = "";
    let yVal = "";

    const arr = [];
    for (let i = 0; i < count2.value; i++) {
        const x = random(0, maxX2.value);
        const y = random(0, maxY2.value);
        arr.push({ x, y });
        xVal += " " + x.toString();
        yVal += " " + y.toString();
    }
    arr.sort((a, b) => a.x - b.x);
    dataGroups.value[1] = arr;
    x2Val.value = xVal;
    y2Val.value = yVal;
};
onMounted(() => {
    reCalc1();
    reCalc2();
});

const x1Val = ref<string>("");
const y1Val = ref<string>("");

const x2Val = ref<string>("");
const y2Val = ref<string>("");

const parseStr = (value: string): string =>
    value.trim().replace(/([^0-9.]+)/g, " ");

const makeArray = (value: string): number[] =>
    value.split(" ").map((num) => parseFloat(num) || 0);

const applyValues = (line: number) => {
    const xRef = line === 1 ? x1Val : x2Val;
    const yRef = line === 1 ? y1Val : y2Val;

    xRef.value = parseStr(xRef.value);
    yRef.value = parseStr(yRef.value);

    const xValues = makeArray(xRef.value);
    const yValues = makeArray(yRef.value);

    if (xValues.length !== yValues.length) {
        return;
    }
    const arr = [];
    for (let i in xValues) {
        arr.push({
            x: xValues[i],
            y: yValues[i],
        });
    }
    arr.sort((a, b) => a.x - b.x);
    dataGroups.value[line - 1] = arr;
};
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
        <button @click="reCalc1">Random 1</button>
        <button
            @click="
                () => {
                    reCalc1();
                    reCalc2();
                }
            "
        >
            Random Both
        </button>
        <button @click="reCalc2">Random 2</button>
    </div>
    <div class="center raw-input">
        <div class="raw-group">
            <label for="x1">X Values for line 1</label>
            <textarea
                placeholder="Comma or Space separated"
                id="x1"
                v-model="x1Val"
            ></textarea>
        </div>
        <div class="raw-group">
            <label for="y1">Y Values for line 1</label>
            <textarea
                placeholder="Comma or Space separated"
                id="y1"
                v-model="y1Val"
            ></textarea>
        </div>
        <div>
            <button @click="applyValues(1)">Apply Line 1</button>
        </div>
    </div>

    <div class="center raw-input">
        <div class="raw-group">
            <label for="x2">X Values for line 2</label>
            <textarea
                placeholder="Comma or Space separated"
                id="x2"
                v-model="x2Val"
            ></textarea>
        </div>
        <div class="raw-group">
            <label for="y2">Y Values for line 2</label>
            <textarea
                placeholder="Comma or Space separated"
                id="y2"
                v-model="y2Val"
            ></textarea>
        </div>
        <div>
            <button @click="applyValues(2)">Apply Line 2</button>
        </div>
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

.raw-input {
    margin: 20px auto;
    display: flex;
    gap: 10px;
}
.raw-group {
    flex-grow: 1;
}
.raw-input button {
    margin-top: 100%;
    transform: translateY(-100%);
}

label,
textarea {
    display: block;
    width: 100%;
    margin-top: 10px;
}
</style>
