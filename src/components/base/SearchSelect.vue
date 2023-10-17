<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";
import Loading from "@/Icons/Loading.vue";
import { fetchApi } from "@/helpers/http";

interface Props {
    url: (value: string) => string;
    placeholder?: string;
}
const props = defineProps<Props>();

const isLoading = ref<boolean>(false);
const isResultsVisible = ref<boolean>(false);
const rows = ref<Array<Record<string, any>>>([]);

onMounted(() => {
    window.addEventListener("click", hideResults);
    loadResults();
});
onUnmounted(() => {
    window.removeEventListener("click", hideResults);
});

function hideResults() {
    isResultsVisible.value = false;
}

let tOut = 0,
    str = "",
    ctrl = new AbortController();

const loadResults = async () => {
    tOut = 0;
    const url = props.url(str.trim());

    if (isLoading.value) {
        ctrl.abort();
        ctrl = new AbortController();
    }

    isLoading.value = true;
    const res = await fetchApi(url, {
        signal: ctrl.signal,
    });
    isLoading.value = false;
    if (res.success) {
        rows.value = res.rows;
    } else {
        console.warn(res.message);
    }
};

const handleInput = (evt: any) => {
    if (tOut) {
        clearTimeout(tOut);
    }
    str = evt.target.value;
    tOut = setTimeout(loadResults, 500);
};

const filter = (filterer: (item: any) => boolean) => {
    rows.value = rows.value.filter(filterer);
};
</script>
<template>
    <div class="search-select" @click.stop>
        <input
            type="text"
            :placeholder="placeholder"
            @focus="isResultsVisible = true"
            @input="handleInput"
        />
        <Icon view-box="20" size="15" class="caret-icon" v-if="!isLoading">
            <path
                fill="currentColor"
                d="m17.704 6.58l-6.972 8.086a.967.967 0 0 1-1.463 0L2.296 6.58C1.76 5.96 1.967 5 2.791 5h14.42c.821 0 1.029.96.493 1.58Z"
            />
        </Icon>
        <Loading v-else class="caret-icon" size="15" />
        <div class="searched-items" v-if="isResultsVisible">
            <slot :items="rows" :filter="filter"></slot>
        </div>
    </div>
</template>
<style lang="scss">
.search-select {
    position: relative;

    input {
        margin: 0;
        border: 1px solid var(--clr-black);
        max-width: 100% !important;
        padding: 7px 30px 10px 7px !important;

        &:focus {
            outline: none;
            box-shadow: 0 0 2px var(--clr-accent);
            border-color: transparent;
        }
    }

    .caret-icon {
        position: absolute;
        top: 12px;
        right: 10px;
        pointer-events: none;
        opacity: 0.6;
    }

    .searched-items {
        position: absolute;
        width: 100%;
        bottom: 100%;
        left: 0;
        background: var(--clr-white);
        box-shadow: 0 0 3px var(--clr-grey);
        margin: 0;
        padding: 0;
        margin-bottom: 5px;

        min-height: 20px;
        max-height: 300px;
        overflow-y: auto;
    }
}
</style>
