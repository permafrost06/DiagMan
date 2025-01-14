<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

export interface PaginationProps {
    onEachSide?: number;
    maxPage: number;
    itemCount: number;
    perPage: number;
}

const route = useRoute();
const currentPage = computed(() => {
    return parseInt(route.query.page as string) || 1;
});

const props = withDefaults(defineProps<PaginationProps>(), {
    onEachSide: 1,
});

const pages = computed(() => {
    const current = currentPage.value;
    const onEachSide = props.onEachSide;
    const max = props.maxPage;

    const pages: number[] = [];
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
</script>

<template>
    <div class="pagination">
        <p v-if="itemCount">
            Showing
            <span class="items-range">
                {{ (currentPage - 1) * perPage + 1 }}-{{
                    currentPage * perPage
                }}
            </span>
            out of {{ itemCount }}
        </p>
        <nav class="page_nums">
            <button
                v-if="currentPage <= 1"
                class="disabled page-prev page_item"
            >
                <svg
                    width="9"
                    height="12"
                    viewBox="0 0 9 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M8 1L2 5.5L8 10" stroke="black" stroke-width="2" />
                </svg>
            </button>
            <RouterLink
                v-else
                :to="{ query: { ...route.query, page: currentPage - 1 } }"
                class="page-prev page_item"
            >
                <svg
                    width="9"
                    height="12"
                    viewBox="0 0 9 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M8 1L2 5.5L8 10" stroke="black" stroke-width="2" />
                </svg>
            </RouterLink>
            <RouterLink
                v-for="(page, idx) in pages"
                :key="'page-' + idx"
                :class="{
                    page_item: true,
                    page_num: page !== 0,
                    page_dots: page === 0,
                    active: page == currentPage,
                }"
                :to="{ query: { ...route.query, page: page } }"
            >
                {{ !page ? "..." : page }}
            </RouterLink>
            <button
                v-if="currentPage >= maxPage"
                class="disabled page-next page_item"
            >
                <svg
                    width="9"
                    height="12"
                    viewBox="0 0 9 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 10L7 5.5L1 1" stroke="black" stroke-width="2" />
                </svg>
            </button>
            <RouterLink
                v-else
                :to="{ query: { ...route.query, page: currentPage + 1 } }"
                class="page-next page_item"
            >
                <svg
                    width="9"
                    height="12"
                    viewBox="0 0 9 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 10L7 5.5L1 1" stroke="black" stroke-width="2" />
                </svg>
            </RouterLink>
        </nav>
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
