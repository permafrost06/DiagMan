<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { computed, ref } from "vue";
import InputTestUnit from "./InputTestUnit.vue";

interface Props {
    tests?: Array<Record<string, string>>;
    onTotalChange: (total: number) => void;
    isComplementary?: boolean;
}

const props = defineProps<Props>();
const selectedTests = ref<Array<Record<string, string>>>(props.tests || []);
const allTests = ref<Record<string, any>[]>([]);

async function getAllTests() {
    const res = await fetchApi(API_BASE + "/misc?name=test");
    if (!res.success) {
        console.error(res.message);
        return;
    }
    const parsed: Array<any> = [];
    res.rows.forEach((row: any) => {
        try {
            const data = JSON.parse(row.data);
            parsed.push(data);
        } catch (_err) {
            console.error("Invalid test data:", row.data);
        }
    });
    allTests.value = parsed;
}

getAllTests();

const total = computed(() => {
    const total = selectedTests.value.reduce(
        (prev, cur) => prev + parseInt(cur.price || "0"),
        0
    );
    props.onTotalChange(total);
    return total;
});
</script>

<template>
    <div class="patient-tests-selector">
        <div class="tests">
            <InputTestUnit
                v-model="selectedTests[0]"
                :tests="(allTests as any)"
                :selected-tests="(selectedTests as any)"
                :is-complementary="isComplementary"
            />
        </div>
        <div class="total">
            <p>Subtotal</p>
            <p>{{ isComplementary ? 0 : (total / 100).toFixed(2) }}</p>
        </div>
    </div>
</template>

<style lang="scss">
.patient-tests-selector {
    .tests {
        border-bottom: 1px solid var(--clr-black);
        padding-bottom: 10px;

        > * {
            margin-bottom: 5px;
        }
    }

    .total {
        display: grid;
        grid-template-columns: 1fr 95px;
        padding: 10px 0;
    }
}
</style>
