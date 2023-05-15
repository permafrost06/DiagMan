<script lang="ts" setup>
import Notification, {
    type NotificationProps,
} from "@/components/notification/Notification.vue";
import NotificationGroup from "@/components/notification/NotificationGroup.vue";
import NotificationItem from "@/components/notification/NotificationItem.vue";
import { ref } from "vue";

const notificationGroups = [
    {
        title: "Today",
        items: [
            {
                text: "You have 142 reports to deliver.",
            },
            {
                text: "C-1201 repott is pending, Please complete the report as early as possible. Time is running out.",
            },
        ],
    },
];

const state = ref<NotificationProps["state"]>("closed");

const toggleState = () => {
    state.value = state.value === "open" ? "closed" : "open";
};
</script>
<template>
    <div class="options">
        <div class="option">
            <button @click="toggleState">Toggle state from parent</button>
        </div>
    </div>
    <div class="flex">
        <Notification>
            <NotificationGroup
                v-for="group in notificationGroups"
                :key="group.title"
                :title="group.title"
            >
                <NotificationItem
                    v-for="(item, idx) in group.items"
                    :key="idx"
                    :text="item.text"
                />
            </NotificationGroup>
        </Notification>
        <Notification v-model:state="state">
            <NotificationGroup
                v-for="group in notificationGroups"
                :key="group.title"
                :title="group.title"
            >
                <NotificationItem
                    v-for="(item, idx) in group.items"
                    :key="idx"
                    :text="item.text"
                />
            </NotificationGroup>
        </Notification>
    </div>
</template>

<style scoped>
.flex {
    display: flex;
}
</style>
