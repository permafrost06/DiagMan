<script lang="ts" setup>
import Pagination from "@/components/Pagination.vue";
import { ref } from "vue";
const page1 = ref<number>(1);
const page2 = ref<number>(1);

const onEachSide = ref<number>(1);
const itemCount = ref<number>(100);

const pages = ref<number>(10);
const pageSize = ref<number>(10);
</script>

<template>
    <div class="options">
        <div class="option">
            <p>onEachSide: {{ onEachSide }}</p>
            <button @click="onEachSide++">+</button>
            <button @click="onEachSide > 0 && onEachSide--">-</button>
        </div>

        <div class="option">
            <p>Item Count:</p>
            <input type="number" v-model="itemCount" />
        </div>
    </div>

    <div class="options">
        <div class="option">
            <p>pages: {{ pages }}</p>
            <button @click="pages++">+</button>
            <button @click="pages > 1 && pages--">-</button>
        </div>
    </div>
    <div class="pagination-wrapper">
        <Pagination
            v-model="page1"
            :pages="pages"
            :item-count="itemCount"
            :on-each-side="onEachSide"
        />
    </div>
    <div class="options">
        <div class="option">
            <p>pageSize: {{ pageSize }}</p>
            <button @click="pageSize++">+</button>
            <button @click="pageSize > 1 && pageSize--">-</button>
        </div>
    </div>
    <div class="pagination-wrapper">
        <Pagination
            v-model="page2"
            :page-size="pageSize"
            :item-count="itemCount"
            :on-each-side="onEachSide"
        />
    </div>
</template>
<style scoped>
.pagination-wrapper {
    width: max-content;
    margin: 20px auto;
}

.options + .options,
.pagination-wrapper + .options {
    margin-top: 100px;
}
</style>
