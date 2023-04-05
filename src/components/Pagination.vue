<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import AngleLeft from "@/Icons/AngleLeft.vue";
import AngleRight from "@/Icons/AngleRight.vue";
import { computed, onMounted, ref } from "vue";

export interface PaginationProps {
    current?: number;
    onEachSide?: number;
    allItems: Array<any>;
    items: Array<any>;
    pageSize?: number;
    pages?: number;
}

const emit = defineEmits<{
    (e: "update:items", values: any[]): void;
}>();

const props = withDefaults(defineProps<PaginationProps>(), {
    onEachSide: 2,
});

const allItems = ref<any[]>(props.allItems);
const currentPage = ref<number>(props.current || 1);
const maxPage = ref<number>(props.pages || 1);
const pageSize = ref<number>(props.pageSize || 5);

if (props.pages) {
    pageSize.value = Math.ceil(allItems.value.length / props.pages);
} else {
    maxPage.value = Math.ceil(allItems.value.length / pageSize.value);
}

if (currentPage.value < 1) {
    currentPage.value = 1;
} else if (currentPage.value > maxPage.value) {
    currentPage.value = maxPage.value;
}

const pages = computed(() => {
    return getPageNumbers(currentPage.value, maxPage.value, props.onEachSide);
});

onMounted(() => {
    toPage(currentPage.value);
});

function toPage(page: number) {
    if (page > maxPage.value || page < 1) {
        return;
    }
    currentPage.value = page;
    const items: any[] = [];
    const start = (currentPage.value - 1) * pageSize.value;
    const end = currentPage.value * pageSize.value;

    for (let i = start; i < end; i++) {
        items.push(allItems.value[i]);
    }
    emit("update:items", items);
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
                >{{ (currentPage - 1) * pageSize + 1 }}-{{
                    currentPage * pageSize
                }}</b
            >
            out of {{ allItems.length }}
        </p>
        <ul class="page_nums">
            <li>
                <button
                    @click="toPage(currentPage - 1)"
                    class="page-prev page_item"
                    :class="{ disabled: currentPage <= 1 }"
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
                    active: page == currentPage,
                }"
                @click="toPage(page)"
            >
                {{ !page ? "..." : page }}
            </li>
            <li>
                <button
                    class="page-next page_item"
                    :class="{ disabled: currentPage >= maxPage }"
                    @click="toPage(currentPage + 1)"
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
}
.page_dots {
    padding: 0 4px;
}
.page_num {
    width: var(--size);
    height: var(--size);
    border-radius: 0.4rem;
}
.page_num:hover {
    color: var(--active);
}
.page_num.active {
    color: #ffffff;
    background: var(--active);
    font-weight: bold;
}
</style>
