<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
defineProps<{
    gap?: string;
    cols?: number;
}>();
</script>
<template>
    <div
        :style="{
            display: 'grid',
            gap: gap || 0,
            gridTemplateColumns: cols
                ? `repeat(${cols}, 1fr)`
                : `repeat(auto-fit, minmax(200px, 1fr))`,
        }"
    >
        <slot></slot>
    </div>
</template>
