<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Icon from "@/components/base/Icon.vue";

interface Props {
    class?: any;
    size?: number | string;
}
const props = withDefaults(defineProps<Props>(), {
    size: 20,
});
</script>

<template>
    <Icon view-box="20" :size="size" :class="[props.class, 'loading-icon']">
        <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M11 16a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm-6.259-3a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm11.578.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM18.5 9.319a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3ZM2.5 6a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm15.286-.793a1 1 0 1 1 0 2a1 1 0 0 1 0-2ZM8 0a3 3 0 1 1 0 6a3 3 0 0 1 0-6Zm7.5 3a.5.5 0 1 1 0 1a.5.5 0 0 1 0-1Z"
        />
    </Icon>
</template>

<style>
@keyframes loading-icon-animation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
.loading-icon {
    animation: loading-icon-animation infinite 800ms linear;
}
</style>
