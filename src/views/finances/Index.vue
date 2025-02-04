<script lang="ts" setup>
import Icon from "@/components/base/Icon.vue";
import MonthSelector, {
    MonthSelection,
} from "@/components/form/MonthSelector.vue";

import TakaIcon from "@/Icons/taka.svg";

import router from "@/router";
import { computed, onMounted, ref, watch } from "vue";
import Chart from "@/components/chart/Chart.vue";
import type { BarChartData } from "@/components/chart/BarChart";
import { DonutChartData } from "@/components/chart/DonutChart";
import { fetchApi } from "@/helpers/http";
import { API_BASE } from "@/helpers/config";
import { formatNumber } from "@/helpers/utils";

const loading = ref(false);
const reqCtrl = ref<AbortController | null>(null);
const selectedMonths = ref<MonthSelection>({
    year: new Date().getFullYear(),
    start: new Date().getMonth(),
});

interface SaleData {
    total: number;
    last: number;
    avg: number;
}

interface TestItem {
    name: string;
    amount: number;
}
interface BarItem {
    type: "histo" | "cyto";
    week: string;
    total_sum: number;
}
const apiData = ref<{
    revenue: SaleData;
    discount: SaleData;
    tests: TestItem[];
    barChart: BarItem[];
} | null>(null);

const fetchData = async () => {
    if (loading.value) {
        reqCtrl.value?.abort();
        reqCtrl.value = new AbortController();
    }
    if (!reqCtrl.value) {
        reqCtrl.value = new AbortController();
    }
    loading.value = true;
    try {
        const res = await fetchApi(
            `${API_BASE}/finances?from=${selectedMonths.value.year}-${
                selectedMonths.value.start + 1
            }`,
            {
                signal: reqCtrl.value?.signal,
            },
        );
        if (!res.success) {
            return;
        }
        apiData.value = res.data;
    } catch (_) {
        // keep
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

watch(selectedMonths, () => {
    fetchData();
});

const computeSale = (data?: SaleData) => {
    if (!data) {
        return {
            total: 0,
            last: 0,
            avg: 0,
        };
    }

    const { total, last, avg } = data;
    let avg_growth = 0;
    if (!avg) {
        avg_growth = total ? 100 : 0;
    } else {
        avg_growth = ((total - avg) / avg) * 100;
    }
    let last_growth = 0;
    if (!last) {
        last_growth = total ? 100 : 0;
    } else {
        last_growth = ((total - last) / last) * 100;
    }

    const avg_up = avg_growth >= 0;
    const last_up = last_growth >= 0;
    return {
        amount: formatNumber(total / 100),
        last: last_up
            ? last_growth.toFixed(2)
            : Math.abs(last_growth).toFixed(2),
        avg: avg_up ? avg_growth.toFixed(2) : Math.abs(avg_growth).toFixed(2),
        avg_up,
        last_up,
    };
};

const revenue = computed(() => computeSale(apiData.value?.revenue));
const discount = computed(() => computeSale(apiData.value?.discount));

const barChartData = computed<BarChartData>(() => {
    if (!apiData.value || apiData.value.barChart.length == 0) {
        return {
            labels: ["01", "02", "03", "04", "05", "06", "07"],
            keys: [
                { key: "histo", color: "#6C63FF", label: "Histopathology" },
                { key: "cyto", color: "#D3D3D3", label: "Cytopathology" },
            ],
            values: Array(7)
                .fill(0)
                .map(() => ({ histo: 0, cyto: 0 })),
        };
    }
    const labels: string[] = [];
    const values: BarChartData["values"] = [];

    const weeks: string[] = [];
    const vals: Record<string, BarChartData["values"][number]> = {};

    apiData.value.barChart.forEach((item) => {
        labels.push(item.week.split("-")[1]);
        weeks.push(item.week);
        let val = vals[item.week];
        if (!val) {
            val = { histo: 0, cyto: 0 };
            vals[item.week] = val;
        }
        val[item.type] = Math.round(item.total_sum / 100);
    });

    weeks.forEach((week) => {
        values.push({
            histo: vals[week].histo || 0,
            cyto: vals[week].cyto || 0,
        });
    });

    return {
        labels,
        values,
        keys: [
            { key: "histo", color: "#6C63FF", label: "Histopathology" },
            { key: "cyto", color: "#D3D3D3", label: "Cytopathology" },
        ],
    };
});

const donutChartData = computed<DonutChartData>(() => {
    if (!apiData.value || apiData.value.tests.length == 0) {
        return [
            {
                label: "None",
                value: 100,
                color: "#A463F2",
            },
        ];
    }

    const values: DonutChartData = [];
    const total = apiData.value.tests.reduce((acc, item) => {
        return acc + item.amount;
    }, 0);
    apiData.value.tests.forEach((item, i) => {
        values.push({
            label: item.name,
            value: Math.round((item.amount / total) * 100),
            color: `hsl(${i * 30}, 50%, 50%)`,
        });
    });
    return values;
});
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
                <MonthSelector
                    :range-select="false"
                    :as-block="true"
                    v-model="selectedMonths"
                />
                <h2 class="finance-months">{{ selectedMonths.formatted }}</h2>
                <div class="finance-info">
                    <h3>Revenue</h3>
                    <p class="finance-info-value">
                        <TakaIcon />
                        {{ revenue.amount }}/-
                    </p>
                    <p
                        :class="{
                            'finance-info-loading': loading,
                            'finance-info-up': revenue.last_up,
                            'finance-info-down': !revenue.last_up,
                        }"
                    >
                        <span v-if="!loading">
                            {{ revenue.last + "%" }}
                        </span>
                        {{ loading ? "" : "from last month" }}
                    </p>
                    <p
                        :class="{
                            'finance-info-loading': loading,
                            'finance-info-up': revenue.avg_up,
                            'finance-info-down': !revenue.avg_up,
                        }"
                    >
                        <span v-if="!loading">
                            {{ revenue.avg + "%" }}
                        </span>
                        {{ loading ? "" : "from average" }}
                    </p>
                </div>
                <div class="finance-info">
                    <h3>Discount Given</h3>
                    <p class="finance-info-value">
                        <TakaIcon />
                        {{ discount.amount }}/-
                    </p>
                    <p
                        :class="{
                            'finance-info-loading': loading,
                            'finance-info-up': discount.last_up,
                            'finance-info-down': !discount.last_up,
                        }"
                    >
                        <span v-if="!loading">
                            {{ discount.last + "%" }}
                        </span>
                        {{ loading ? "" : "from last month" }}
                    </p>
                    <p
                        :class="{
                            'finance-info-loading': loading,
                            'finance-info-up': discount.avg_up,
                            'finance-info-down': !discount.avg_up,
                        }"
                    >
                        <span v-if="!loading">
                            {{ discount.avg + "%" }}
                        </span>
                        {{ loading ? "" : "from average" }}
                    </p>
                </div>
            </div>
            <div class="charts-area">
                <Chart class="chart-item" type="bar" :data="barChartData" />
                <Chart class="chart-item" type="donut" :data="donutChartData" />
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
            span {
                color: var(--clr-success);
            }
            &::before {
                content: "\2B06";
            }
        }
        &-down {
            span {
                color: var(--clr-danger);
            }
            &::before {
                content: "\2B07";
            }
        }

        &-loading {
            color: var(--clr-black);
            position: relative;
            height: 10px;
            &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 15px;
                background: var(--clr-black);
                opacity: 0.4;
            }

            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 20px;
                height: 100%;
                width: 100px;
                background: var(--clr-black);
                opacity: 0.4;
            }
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
