<script lang="ts" setup>
export interface NotificationItem {
    text: string;
    link?: string;
}

defineProps<NotificationItem>();
</script>
<template>
    <li class="notification-item">
        <template v-if="link">
            <a :href="link" class="notification-link">{{ text }}</a>
            <a :href="link" class="notification-btn"></a>
        </template>
        <template v-else>{{ text }}</template>
    </li>
</template>
<style scoped>
.notification-item {
    padding: 8px;
    padding-left: var(--space-x);
    padding-right: var(--space-x);
    color: #5c5c5c;
    background: #f1f1f1;
    border-radius: 8px;
    margin-bottom: 2px;
}

.notification-link {
    text-decoration: none;
}
.notification-btn {
}
</style>
