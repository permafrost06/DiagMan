<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

export interface PaginationProps {
    onEachSide?: number;
    maxPage: number;
    itemCount: number;
    shownItems?: number;
    perPage: number;
}

const route = useRoute();
const router = useRouter();
const currentPage = computed(() => {
    return parseInt(route.query.page as string) || 1;
});
const pageInput = ref(currentPage.value);

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

const goToPage = () => {
    const page = pageInput.value;
    if (page < 1 || page > props.maxPage) {
        pageInput.value = currentPage.value;
        return;
    }
    router.push(
        router.resolve({
            query: {
                ...route.query,
                page,
            },
        }),
    );
};
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
            <template v-if="shownItems"> ({{ shownItems }} rows)</template>
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
            <template v-for="(page, idx) in pages" :key="'page-' + idx">
                <RouterLink
                    v-if="page !== 0"
                    :class="{
                        page_item: true,
                        page_num: true,
                        active: page == currentPage,
                    }"
                    :to="{ query: { ...route.query, page: page } }"
                >
                    {{ !page ? "..." : page }}
                </RouterLink>
                <span v-else class="page_item page_dots">...</span>
            </template>
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
        <div class="go-to">
            <input
                type="number"
                v-model="pageInput"
                :min="1"
                :max="maxPage"
                :placeholder="currentPage.toString()"
                @keydown="(e) => e.key === 'Enter' && goToPage()"
            />
            <button type="button" @click="goToPage">GO</button>
        </div>
    </div>
</template>
<style scoped lang="scss">
.pagination {
    display: flex;
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
    color: var(--clr-black);

    p {
        padding: 0 15px;
        color: var(--clr-black);
    }

    .items-range {
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

    .go-to {
        display: flex;
        align-items: stretch;
        margin-left: 10px;
        border: 1px solid var(--clr-black);

        &:has(input:focus) {
            box-shadow: 0 0 2px var(--clr-accent);
        }

        input {
            border: none;
            padding: 2px 5px;
            margin: 0;
            min-width: 40px;
            field-sizing: content;
            text-align: center;

            &:focus {
                outline: none;
                box-shadow: none;
            }
        }

        button {
            padding: 0 5px;

            &:hover {
                background: var(--clr-black);
                color: var(--clr-white);
            }
        }
    }
}
</style>
