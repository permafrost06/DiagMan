<script lang="ts" setup>
export interface NotificationGroup {
    title: string;
}
defineProps<NotificationGroup>();
</script>
<template>
    <div class="notification-group">
        <h4>{{ title }}</h4>
        <ul>
            <slot></slot>
        </ul>
    </div>
</template>
<style scoped>
.notification-group {
    --space-x: 10px;
    margin-bottom: 10px;
}

.notification-group h4 {
    margin: 0;
    padding: 10px;
    padding-left: var(--space-x);
    padding-right: var(--space-x);
    color: #333;
    font-weight: normal;
    font-size: 0.8rem;
}

.notification-group > ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}
</style>
