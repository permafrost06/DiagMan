<script lang="ts">
/*Declearations had to be separated because of volar error*/

type TableCol = string;
interface TableXProps{
    cols: TableCol
}
</script>

<script setup lang="ts">
defineProps<TableXProps>();
</script>

<template>
    <div>This is a table with cols: {{ cols }}</div>
</template>