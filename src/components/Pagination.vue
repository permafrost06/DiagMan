<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import AngleLeft from "@/Icons/AngleLeft.vue";
import AngleRight from "@/Icons/AngleRight.vue";
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
}

const emit = defineEmits<{
    (e: "update:modelValue", page: number): void;
}>();

const props = withDefaults(defineProps<PaginationProps>(), {
    onEachSide: 2,
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
    return getPageNumbers(
        props.modelValue,
        pageDetails.value.total,
        props.onEachSide
    );
});

onMounted(() => {
    toPage(props.modelValue);
});

function toPage(page: number) {
    if (page < 1) {
        page = 1;
    }
    if (page > pageDetails.value.total) {
        page = pageDetails.value.total;
    }
    emit("update:modelValue", page);
}

function getPageNumbers(current: number, max: number, onEachSide: number) {
    const pages: number[] = [];

    // Calculate the start and end page numbers for the range
    let start = Math.max(current - onEachSide, 1);
    const end = Math.min(current + onEachSide, max);

    // First stop starting from 1
    const firstEdge = Math.min(onEachSide + 1, start);

    //Beginning of the end
    let lastEdge = Math.max(end, max - onEachSide);

    if (firstEdge > 1) {
        /**
         * If the `firstEdge > 1` we should add the beginning cluster of the pages
         * 1,2,3
         */
        for (let i = 1; i <= firstEdge; i++) {
            pages.push(i);
        }
        if (firstEdge < start - 1) {
            /**
             * If there is a gap between the firstEdge and the start then we should separate the cluster
             * 1,2,3    ...      x,y,z
             */
            pages.push(0);
        } else if (firstEdge === start) {
            // If firstEdge == start, increase the start to avoid duplication
            start++;
        }
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (lastEdge < max) {
        if (lastEdge > end + 1) {
            pages.push(0);
        } else if (lastEdge === end) {
            lastEdge++;
        }

        for (let i = lastEdge; i <= max; i++) {
            pages.push(i);
        }
    }

    return pages;
}
</script>

<template>
    <div class="pagination">
        <p>
            Showing
            <b
                >{{ (modelValue - 1) * pageDetails.size + 1 }}-{{
                    modelValue * pageDetails.size
                }}</b
            >
            out of {{ itemCount }}
        </p>
        <ul class="page_nums">
            <li key="prev">
                <button
                    @click="toPage(modelValue - 1)"
                    class="page-prev page_item"
                    :class="{ disabled: modelValue <= 1 }"
                >
                    <AngleLeft fill="var(--text)" />
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
                    <AngleRight fill="var(--text)" />
                </button>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.pagination {
    --size: 35px;
    --btn-margin: 10px;

    --dark: #000000;
    --active: #23adad;
    --border: #a7a7a7;
    --text: #5f5f5f;
    --gray: #e7e7e7;
}
.pagination {
    display: flex;
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
}

.pagination p {
    padding: 0 15px;
    color: var(--text);
}

.pagination p b {
    color: var(--dark);
}

.page-next,
.page-prev {
    border: none;
    margin: 0 4px;
    transition: all 300ms ease-in-out;
    background: white;
    padding: 0;
}

.page-prev {
    border-right: 1px solid var(--gray);
}

.page-next {
    border-left: 1px solid var(--gray);
}

.page-next:hover,
.page-prev:hover {
    background: var(--gray);
    border-radius: 5px;
}

.page-next.disabled,
.page-prev.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.page-next.disabled:hover,
.page-prev.disabled:hover {
    background: white;
    border-radius: 0;
}

.pagination svg {
    height: calc(var(--size) - var(--btn-margin) * 2);
    width: calc(var(--size) - var(--btn-margin) * 2);
    margin: var(--btn-margin);
    opacity: 0.7;
}

.page_nums {
    list-style-type: none;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 4px 0;
    border: 1px solid var(--border);
    background: white;
    border-radius: 5px;
}
.page_item {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: var(--text);
    height: var(--size);
    user-select: none;
}
.page_dots {
    padding: 0 4px;
}
.page_num {
    height: var(--size);
    border-radius: 0.4rem;
    margin: 0 5px;
    padding: 0 8px;
    box-sizing: border-box;
}
.page_num:hover {
    color: var(--active);
}
.page_num.active {
    min-width: var(--size);
    color: #ffffff;
    background: var(--active);
    font-weight: bold;
}
</style>
