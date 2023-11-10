<script setup lang="ts">
import Icon from "@/components/base/Icon.vue";
import SearchSelect from "@/components/base/SearchSelect.vue";
import TestFormModal from "@/components/view/TestFormModal.vue";
import { API_BASE } from "@/helpers/config";
import { ref, watch } from "vue";

interface Props {
    tests?: Array<Record<string, string>>;
    isComplementary?: boolean;
    onTotalChange: (total: number) => void;
}

const props = defineProps<Props>();
const tests = ref<Array<Record<string, number | string>>>(props.tests || []);
const total = ref<number>(0);
const testAdder = ref<boolean>(false);
const testPrices = ref<Record<string, string>>({});

watch(props, () => {
    let total2 = 0;
    if (!props.isComplementary) {
        tests.value.forEach((t: any) => {
            const price = parseInt(t.price);
            total2 += price;
            testPrices.value[t.id] = (price / 100).toFixed(2);
        });
    }
    total.value = total2;
    props.onTotalChange(total2);
});

const addTest = (test: any) => {
    tests.value.push(test);
    if (props.isComplementary) {
        return;
    }
    const price = parseInt(test.price);
    testPrices.value[test.id] = (price / 100).toFixed(2);
    total.value += price;
    props.onTotalChange(total.value);
};
const removeTest = (test: any) => {
    tests.value = tests.value.filter((t) => t.id != test.id);
    if (props.isComplementary) {
        return;
    }
    total.value -= parseInt(test.price);
    props.onTotalChange(total.value);
};

const getSearchUrl = (val: string) => {
    const notIn = encodeURIComponent(
        JSON.stringify(tests.value.map((t) => t.id))
    );
    return API_BASE + `/tests?search=${val}&not-in=${notIn}&limit=5`;
};
</script>

<template>
    <div class="patient-tests-selector">
        <SearchSelect
            placeholder="Type here to search for test"
            :url="getSearchUrl"
        >
            <template v-slot="{ items, filter }">
                <ul class="searched-tests">
                    <li v-if="items.length === 0">
                        <p class="danger">No results matched your query!</p>
                    </li>
                    <li>
                        <button
                            type="button"
                            class="add-test-btn"
                            @click="testAdder = true"
                        >
                            Add new test
                        </button>
                    </li>
                    <li v-for="item in items" :key="item.id">
                        <button
                            type="button"
                            class="test-result"
                            @click="
                                () => {
                                    addTest(item);
                                    filter((i) => i.id !== item.id);
                                }
                            "
                        >
                            <p class="test-name">{{ item.name }}</p>
                            <div class="tr-details">
                                <p>
                                    BDT
                                    {{ ((item.price as any) / 100).toFixed(2) }}
                                </p>
                                <p class="capitalize">
                                    {{ item.size || "N/A" }}
                                </p>
                                <p class="capitalize">
                                    {{ item.type }}pathology
                                </p>
                            </div>
                        </button>
                    </li>
                </ul>
            </template>
        </SearchSelect>
        <div class="tests" v-if="tests.length > 0">
            <template v-for="test in tests" :key="test.id">
                <p>{{ test.name }}</p>
                <p><input type="hidden" name="tests" :value="test.id" /></p>
                <p v-if="isComplementary">0</p>
                <input
                    v-else
                    type="number"
                    step="0.01"
                    v-model="testPrices[test.id]"
                    :name="`test_price[${test.id}]`"
                    class="test_price"
                />
                <button
                    type="button"
                    class="closer"
                    @click="() => removeTest(test)"
                >
                    <Icon view-box="24" size="18">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                        />
                    </Icon>
                </button>
            </template>
        </div>
        <div class="total">
            <p>Subtotal</p>
            <p>{{ (total / 100).toFixed(2) }}</p>
        </div>
    </div>

    <TestFormModal
        v-if="testAdder"
        :onClose="() => (testAdder = false)"
        :onAdded="addTest"
    />
</template>

<style lang="scss">
.patient-tests-selector {
    .tests {
        border-bottom: 1px solid var(--clr-black);
        margin-top: 10px;
        padding-bottom: 10px;

        display: grid;
        grid-template-columns: 1fr max-content 100px 30px;
        gap: 10px 20px;

        .closer {
            background: var(--clr-white);
            color: var(--clr-danger);
            padding: 0;
        }

        .test_price {
            padding: 1px 3px;
        }
    }

    .total {
        display: grid;
        grid-template-columns: 1fr max-content 50px;
        padding: 10px 0;
    }
    .test-result,
    .add-test-btn {
        all: unset;
        border-bottom: 1px solid var(--clr-grey);
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
        padding: 5px 10px;
        font-weight: bold;
    }

    .add-test-btn {
        text-align: center;
        background: var(--clr-black);
        color: var(--clr-white);
        text-transform: uppercase;
        font-size: var(--fs-sm);
        padding: 5px 10px;
    }

    .searched-tests {
        padding: 0;
        margin: 0;

        li {
            list-style-type: none;
        }

        .test-result {
            .tr-details {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: var(--fs-md);
                margin-top: 5px;

                p {
                    background: rgba(var(--clr-grey-rgb), 0.3);
                    font-size: var(--fs-sm);
                    padding: 2px 5px;
                }
            }

            &:focus {
                background: var(--clr-accent);
                color: var(--clr-white);
            }

            &:hover {
                background: rgba(var(--clr-grey-rgb), 0.1);
                color: var(--clr-black);
            }
        }
    }
}
</style>
