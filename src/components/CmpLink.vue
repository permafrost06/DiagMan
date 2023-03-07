<script lang="ts" setup>
export interface Props {
    name: string;
}
defineProps<Props>();
</script>
<template>
    <RouterLink :to="{ name: 'components', params: { name } }">
        <slot></slot>
    </RouterLink>
</template>
