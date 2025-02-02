<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

export interface MonthSelection {
    year: number;
    start: number;
    end?: number;
}

interface Props {
    modelValue?: MonthSelection;
    rangeSelect?: boolean;
    asBlock?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    rangeSelect: true,
});

const emit = defineEmits(["update:modelValue"]);

const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const currentDate = new Date();
const isSelectorOpen = ref<boolean>(false);
const selectorRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const internalSelectedMonths = ref<MonthSelection>({
    year: currentDate.getFullYear(),
    start: currentDate.getMonth(),
});
const lastSelectionDirection = ref<number>(0);
const isRangeActive = ref<boolean>(false);

const selectedMonths = computed<MonthSelection>({
    get: () => props.modelValue ?? internalSelectedMonths.value,
    set: (newValue) => {
        emit("update:modelValue", newValue);
        internalSelectedMonths.value = newValue;
    },
});

const formattedSelectedMonths = computed(() => {
    const val = selectedMonths.value;
    return val.end
        ? `${val.year}, ${months[val.start]} - ${months[val.end]}`
        : `${val.year}, ${months[val.start]}`;
});

const changeYear = (direction: number): void => {
    selectedMonths.value.year += direction;
};

const isSelected = (month: number): boolean => {
    const val = selectedMonths.value;
    if (val.end) {
        return month >= val.start && month <= val.end;
    }
    return month === val.start;
};

const selectRange = (month: number) => {
    let start = selectedMonths.value.start;
    let end = selectedMonths.value.end!;
    const lastDirection = lastSelectionDirection.value;

    const updateSelection = (
        newStart: number,
        newEnd: number,
        direction: number
    ) => {
        selectedMonths.value.start = newStart;
        selectedMonths.value.end = newEnd !== newStart ? newEnd : undefined;
        lastSelectionDirection.value = direction;
    };

    if (lastDirection === 0) {
        if (month < start) {
            updateSelection(month, start, -1);
        } else {
            updateSelection(start, month, 1);
        }
    } else if (lastDirection === 1) {
        if (month < start) {
            updateSelection(month, start, -1);
        } else {
            updateSelection(start, month, 1);
        }
    } else if (lastDirection === -1) {
        if (month < end) {
            updateSelection(month, end, -1);
        } else {
            updateSelection(end, month, 1);
        }
    }
};

const selectMonth = (month: number, event: MouseEvent): void => {
    if (event.shiftKey && props.rangeSelect) {
        selectRange(month);
        return;
    }
    isRangeActive.value = true;
    selectedMonths.value.start = month;
    selectedMonths.value.end = undefined;
    lastSelectionDirection.value = 0;
};

const selectorPosition = ref({ top: "5px", left: "0px" });

const calculatePosition = () => {
    nextTick(() => {
        if (props.asBlock) return;
        const selector = selectorRef.value;
        const trigger = triggerRef.value;

        if (!selector || !trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const selectorRect = selector.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const pos: any = {};

        if (triggerRect.bottom + selectorRect.height <= viewportHeight) {
            pos.top = "calc(100% + 5px)";
        } else {
            pos.bottom = "calc(100% + 5px)";
        }

        if (triggerRect.left + selectorRect.width + 5 <= viewportWidth) {
            pos.left = 0;
        } else {
            pos.right = 0;
        }

        selectorPosition.value = pos;
    });
};

const hideOnOutsideClick = () => {
    isSelectorOpen.value = false;
};
const mouseUp = () => {
    if (!isRangeActive.value) return;
    isRangeActive.value = false;
    selectedMonths.value = {
        ...selectedMonths.value,
    };
};

watch(isSelectorOpen, (newVal) => {
    if (newVal) {
        calculatePosition();
    }
});

onMounted(() => {
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("click", hideOnOutsideClick);
    window.addEventListener("mouseup", mouseUp);
});
onUnmounted(() => {
    window.removeEventListener("resize", calculatePosition);
    window.removeEventListener("click", hideOnOutsideClick);
    window.removeEventListener("mouseup", mouseUp);
});
</script>

<template>
    <div
        :class="{
            'month-selector': true,
            'as-block': props.asBlock,
        }"
    >
        <div
            ref="triggerRef"
            class="selected-display"
            @click.stop="isSelectorOpen = !isSelectorOpen"
        >
            {{ formattedSelectedMonths }}
        </div>

        <div
            v-if="isSelectorOpen || props.asBlock"
            ref="selectorRef"
            class="month-picker"
            :style="selectorPosition"
            @click.stop
        >
            <div class="year-nav">
                <button @click="changeYear(-1)">
                    &#9665; {{ selectedMonths.year - 1 }}
                </button>
                <span>{{ selectedMonths.year }}</span>
                <button @click="changeYear(1)">
                    {{ selectedMonths.year + 1 }} &#9655;
                </button>
            </div>

            <div class="months-grid">
                <div
                    v-for="(month, index) in months"
                    :key="index"
                    class="month"
                    :class="{ selected: isSelected(index) }"
                    @mousedown.prevent="selectMonth(index, $event)"
                    @mouseenter.prevent="isRangeActive && selectRange(index)"
                >
                    {{ month }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.month-selector {
    user-select: none;
    position: relative;

    .selected-display {
        background: var(--clr-white);
        border: 1px solid var(--clr-black);
        cursor: pointer;
        padding: 5px 20px;
    }

    &.as-block {
        .selected-display {
            display: none;
        }
    }

    .month-picker {
        position: absolute;
        background: var(--clr-white);
        border: 1px solid var(--clr-black);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 10px;
        min-width: 200px;
    }

    &.as-block .month-picker {
        position: static;
        box-shadow: none;
    }

    .year-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .months-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
    }

    .month {
        padding: 5px 10px;
        border: 1px solid var(--clr-black);
        cursor: pointer;
        text-align: center;

        &:hover {
            background: #ddd;
        }

        &.selected {
            background: var(--clr-black);
            color: var(--clr-white);
        }
    }
}
</style>
