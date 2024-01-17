<script setup lang="ts">
import { computed, ref } from "vue";

interface Test {
    name: string;
    price: string;
}

const props = defineProps<{
    tests: Test[];
    modelValue?: any;
    isComplementary?: boolean;
}>();
const emit = defineEmits<{
    (e: "remove"): void;
    (e: "add", val: Test): void;
    (e: "update:modelValue", val: Test): void;
}>();
const current = ref(
    props.modelValue
        ? {
              name: props.modelValue.name,
              price: (parseInt(props.modelValue.price) / 100).toFixed(2),
          }
        : { name: "", price: "" }
);
const suggestedTests = ref<Test[]>();

let tOut = 0,
    search = "";
const filterResults = () => {
    if (!search) {
        const newArr: Test[] = [];
        for (let i = 0; i < props.tests.length; i++) {
            const test1 = props.tests[i];
            if (
                props.modelValue?.name?.toLowerCase() ==
                    test1.name.toLowerCase() &&
                props.modelValue?.price == test1.price
            ) {
                newArr.push(test1);
            }
        }
        suggestedTests.value = newArr;
        return;
    }
    const matches: {
        row: Test;
        weight: number;
    }[] = [];
    if (!search) {
        return props.tests.slice(0, 5);
    }

    props.tests.forEach((item) => {
        const name = item.name.toLowerCase();
        const match1 = name.indexOf(search.toLowerCase());
        if (
            match1 > -1 &&
            !(
                props.modelValue?.name.toLowerCase() ==
                    item.name.toLowerCase() &&
                props.modelValue?.price == item.price
            )
        ) {
            matches.push({
                row: item,
                weight: match1,
            });
        }
    });

    suggestedTests.value = matches
        .sort((a, b) => {
            if (a.weight > b.weight) {
                return 1;
            }
            if (b.weight > a.weight) {
                return -1;
            }
            return 0;
        })
        .slice(0, 5)
        .map((item) => item.row);
};
const handleInput = (evt: any) => {
    search = evt.target.value.trim() as string;
    if (tOut) {
        clearTimeout(tOut);
    }
    tOut = window.setTimeout(filterResults, 500);

    const newVal = { ...current.value };
    newVal.price = (parseFloat(newVal.price) * 100) as any;

    emit("update:modelValue", newVal);
};
const suggestionClicked = (test: Test) => {
    (document.querySelector(".suggestions")! as HTMLDivElement).style.display =
        "none";
    setTimeout(() => {
        (
            document.querySelector(".suggestions")! as HTMLDivElement
        ).style.removeProperty("display");
    }, 5);

    if (current.value.name === "" && current.value.price === "") {
        emit("add", test);
    }
    current.value = {
        name: test.name,
        price: (parseInt(test.price) / 100).toFixed(2),
    };

    const newVal = { ...current.value };
    newVal.price = (parseFloat(newVal.price) * 100) as any;

    emit("update:modelValue", newVal);
};
const blur = () => {
    if (!props.modelValue?.name) {
        const newVal = { ...current.value };
        newVal.price = (parseFloat(newVal.price) * 100) as any;
        emit("add", newVal);
    } else {
        const newVal = { ...current.value };
        newVal.price = (parseFloat(newVal.price) * 100) as any;
        emit("update:modelValue", newVal);
    }
};

const suggestedTestsTrimmed = computed(() => {
    return suggestedTests.value?.slice(0, 5);
});
</script>

<template>
    <div class="patient-test-unit">
        <input
            v-model="current.name"
            placeholder="Test name"
            autocomplete="off"
            type="text"
            name="tests"
            @input="handleInput"
            @focus="handleInput"
            @blur="blur"
        />
        <div class="suggestions">
            <button
                type="button"
                class="suggestion-holder"
                v-for="test in suggestedTestsTrimmed"
                :key="test.name"
                @click="suggestionClicked(test)"
                tabindex="-1"
            >
                <div class="suggestion-name">{{ test.name }}</div>
                <div class="suggestion-price">
                    {{ (parseInt(test.price) / 100).toFixed(2) }}
                </div>
            </button>
        </div>
        <input
            v-if="!isComplementary"
            v-model="current.price"
            type="number"
            autocomplete="off"
            step="0.01"
            name="prices"
            placeholder="Test price"
            class="price-input arrow-hidden-input"
            @blur="blur"
            @input="handleInput"
        />
        <input v-else value="0" readonly="true" name="prices" />
    </div>
</template>

<style lang="scss">
.patient-test-unit {
    display: grid;
    grid-template-columns: 1fr 100px;
    gap: 5px 10px;
    position: relative;

    input {
        max-width: 100% !important;
    }

    .suggestions {
        background: white;
        box-shadow: 0 0 5px #5e5e5e;
        width: 100%;
        top: 100%;
        position: absolute;
        display: none;
        z-index: 2;

        .suggestion-holder {
            background: var(--clr-white);
            color: var(--clr-black);
            border-bottom: 1px solid var(--clr-black);
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 104px;
            text-align: left;
            padding: 7px 0;
            gap: 0;
            font-size: var(--fs-md);

            &:hover {
                background-color: var(--clr-accent);
                color: var(--clr-white);
            }

            .suggestion-name {
                padding: 0 5px;
                border-right: 1px solid var(--clr-grey);
            }

            .suggestion-price {
                padding-left: 8px;
            }
        }
    }

    input:focus + .suggestions,
    .suggestions:hover {
        display: block;
    }
}
</style>
