<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted } from "vue";

export interface PageDetails {
    size: number;
    total: number;
}

export interface PaginationProps {
    modelValue: number;
    onEachSide?: number;
    pageSize?: number;
    pages?: number;
    itemCount: number;
    showText?: boolean;
}

const emit = defineEmits<{
    (e: "update:modelValue", page: number): void;
}>();

const props = withDefaults(defineProps<PaginationProps>(), {
    onEachSide: 1,
});

const pageDetails = computed((): PageDetails => {
    if (props.pages) {
        return {
            size: Math.ceil(props.itemCount / props.pages),
            total: props.pages,
        };
    }

    if (props.pageSize) {
        return {
            size: props.pageSize,
            total: Math.ceil(props.itemCount / props.pageSize),
        };
    }

    throw new Error("Either pages or pageCount prop is required!");
});

const pages = computed(() => {
    const current = props.modelValue;
    const onEachSide = props.onEachSide;
    const max = pageDetails.value.total;

    const pages: Number[] = [];
    const start = Math.max(1, current - onEachSide);
    const end = Math.min(max, current + onEachSide);

    if (start > 1) {
        pages.push(1);
    }
    if (start > 2) {
        pages.push(0);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (max - end > 1) {
        pages.push(0);
    }

    if (max > end) {
        pages.push(max);
    }

    return pages;
});

const toPage = (page: number) => {
    if (page < 1) {
        page = 1;
    }
    if (page > pageDetails.value.total) {
        page = pageDetails.value.total;
    }
    emit("update:modelValue", page);
};

onMounted(() => {
    toPage(props.modelValue);
});
</script>

<template>
    <div class="pagination">
        <p v-if="showText">
            Showing
            <span class="items-range">
                {{ (modelValue - 1) * pageDetails.size + 1 }}-{{
                    modelValue * pageDetails.size
                }}
            </span>
            out of {{ itemCount }}
        </p>
        <ul class="page_nums">
            <li key="prev">
                <button
                    @click="toPage(modelValue - 1)"
                    class="page-prev page_item"
                    :class="{ disabled: modelValue <= 1 }"
                >
                    <svg
                        width="9"
                        height="12"
                        viewBox="0 0 9 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8 1L2 5.5L8 10"
                            stroke="black"
                            stroke-width="2"
                        />
                    </svg>
                </button>
            </li>
            <li
                v-for="(page, idx) in pages"
                :key="'page-' + idx"
                :class="{
                    page_item: true,
                    page_num: page !== 0,
                    page_dots: page === 0,
                    active: page == modelValue,
                }"
                @click="toPage(page)"
            >
                {{ !page ? "..." : page }}
            </li>
            <li key="next">
                <button
                    class="page-next page_item"
                    :class="{ disabled: modelValue >= pageDetails.total }"
                    @click="toPage(modelValue + 1)"
                >
                    <svg
                        width="9"
                        height="12"
                        viewBox="0 0 9 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1 10L7 5.5L1 1"
                            stroke="black"
                            stroke-width="2"
                        />
                    </svg>
                </button>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.pagination {
    display: flex;
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
    color: var(--clr-black);
}

.pagination p {
    padding: 0 15px;
    color: var(--clr-black);
}

.pagination .items-range {
    font-weight: bold;
}

.page-next,
.page-prev {
    border: 1px solid var(--clr-black);
}

.page-next.disabled,
.page-prev.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.page_nums {
    list-style-type: none;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 4px 0;
}
.page_item {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: var(--clr-black);
    background: var(--clr-white);
    user-select: none;
    padding: 5px 8px;
}
.page_dots {
    padding: 0 4px;
}
.page_num {
    margin: 0 5px;
    padding: 0px 7px;
    box-sizing: border-box;
    font-size: var(--fs-base);
    text-decoration: underline;
}
.page_num:hover {
    font-weight: 600;
}
.page_num.active {
    border: 1px solid var(--clr-black);
    text-decoration: none;
}
</style>
