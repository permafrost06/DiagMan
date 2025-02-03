<script lang="ts" setup>
import Icon from "@/components/base/Icon.vue";
import MonthSelector, {
    MonthSelection,
} from "@/components/form/MonthSelector.vue";

import TakaIcon from "@/Icons/taka.svg";

import router from "@/router";
import { ref } from "vue";
import Chart from "@/components/chart/Chart.vue";
import type { BarChartData } from "@/components/chart/BarChart";
import { DonutChartData } from "@/components/chart/DonutChart";
const selectedMonths = ref<MonthSelection>({
    year: new Date().getFullYear(),
    start: new Date().getMonth(),
});

const dataGroups = ref<BarChartData>({
    labels: ["Week1", "Week2", "Week3"],
    keys: [
        { key: "histo", color: "#6C63FF", label: "Histopathology" },
        { key: "cyto", color: "#D3D3D3", label: "Cytopathology" },
    ],
    values: [
        { histo: 100, cyto: 200 },
        { histo: 150, cyto: 250 },
        { histo: 180, cyto: 300 },
    ],
});

const data: DonutChartData = [
    {
        label: "Test One",
        value: 30,
        color: "#A463F2",
    },
    {
        label: "Test two",
        value: 23,
        color: "#C4FF00",
    },
    {
        label: "Test three",
        value: 18,
        color: "#00BFFF",
    },
    {
        label: "Test Four",
        value: 17,
        color: "#666666",
    },
    {
        label: "Test Five",
        value: 13,
        color: "#333",
    },
];
</script>
<template>
    <div class="finances-page">
        <div class="finances-header">
            <h1 class="fs-2xl flex-grow">Finances</h1>
            <button
                type="button"
                @click="router.back()"
                class="finances-close-btn"
            >
                <Icon size="40" view-box="36">
                    <path
                        fill="currentColor"
                        d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                        class="clr-i-outline clr-i-outline-path-1"
                    />
                    <path fill="none" d="M0 0h36v36H0z" />
                </Icon>
            </button>
        </div>
        <div class="finance-grid">
            <div>
                <MonthSelector :as-block="true" v-model="selectedMonths" />
                <h2 class="finance-months">{{ selectedMonths.formatted }}</h2>
                <div class="finance-info">
                    <h3>Revenue</h3>
                    <p class="finance-info-value">
                        <TakaIcon />
                        100010/-
                    </p>
                    <p class="finance-info-up">&#11014; +10% from last month</p>
                    <p class="finance-info-down">&#11015; -2% from average</p>
                </div>
                <div class="finance-info">
                    <h3>Discount Given</h3>
                    <p class="finance-info-value">
                        <TakaIcon />
                        100010/-
                    </p>
                    <p class="finance-info-up">&#11014; +10% from last month</p>
                    <p class="finance-info-down">&#11015; -2% from average</p>
                </div>
            </div>
            <div class="charts-area">
                <Chart class="chart-item" type="bar" :data="dataGroups" />
                <Chart class="chart-item" type="donut" :data="data" />
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.finances-page {
    padding: 10px 40px;

    .finances-header {
        display: flex;
        gap: 20px;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--clr-black);

        .finances-close-btn {
            background: transparent;
            color: var(--clr-black);
            padding: 5px;
        }
        .finances-close-btn:hover {
            color: var(--clr-accent);
        }
    }

    .finance-grid {
        display: grid;
        grid-template-columns: 5fr 7fr;
        gap: 40px;
        max-width: 1300px;
        margin-inline: auto;
        margin-top: 50px;
    }

    .finance-months {
        font-weight: bold;
        margin-top: 20px;
        font-size: var(--fs-xl);
    }

    .finance-info {
        margin-top: 20px;
        h3 {
            margin-bottom: 10px;
            font-size: var(--fs-lg);
            font-weight: bold;
        }
        &-value {
            display: flex;
            gap: 5px;
            align-items: center;
            font-size: var(--fs-md);
            margin-bottom: 10px;
        }
        &-up {
            color: var(--clr-success);
        }
        &-down {
            color: var(--clr-danger);
        }
    }

    .charts-area {
        .chart-item {
            height: 300px;
            margin-bottom: 20px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}
</style>
